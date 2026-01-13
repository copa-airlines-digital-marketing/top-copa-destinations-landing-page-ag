import { t as false_default } from "./false.js";
import { d as text_decoder } from "./shared.js";
import * as devalue from "devalue";
function set_nested_value(object, path_string, value) {
	if (path_string.startsWith("n:")) {
		path_string = path_string.slice(2);
		value = value === "" ? void 0 : parseFloat(value);
	} else if (path_string.startsWith("b:")) {
		path_string = path_string.slice(2);
		value = value === "on";
	}
	deep_set(object, split_path(path_string), value);
}
function convert_formdata(data) {
	const result = {};
	for (let key of data.keys()) {
		const is_array = key.endsWith("[]");
		let values = data.getAll(key);
		if (is_array) key = key.slice(0, -2);
		if (values.length > 1 && !is_array) throw new Error(`Form cannot contain duplicated keys — "${key}" has ${values.length} values`);
		values = values.filter((entry) => typeof entry === "string" || entry.name !== "" || entry.size > 0);
		if (key.startsWith("n:")) {
			key = key.slice(2);
			values = values.map((v) => v === "" ? void 0 : parseFloat(v));
		} else if (key.startsWith("b:")) {
			key = key.slice(2);
			values = values.map((v) => v === "on");
		}
		set_nested_value(result, key, is_array ? values : values[0]);
	}
	return result;
}
const BINARY_FORM_CONTENT_TYPE = "application/x-sveltekit-formdata";
var BINARY_FORM_VERSION = 0;
async function deserialize_binary_form(request) {
	if (request.headers.get("content-type") !== "application/x-sveltekit-formdata") {
		const form_data = await request.formData();
		return {
			data: convert_formdata(form_data),
			meta: {},
			form_data
		};
	}
	if (!request.body) throw new Error("Could not deserialize binary form: no body");
	const reader = request.body.getReader();
	const chunks = [];
	async function get_chunk(index) {
		if (index in chunks) return chunks[index];
		let i = chunks.length;
		while (i <= index) {
			chunks[i] = reader.read().then((chunk) => chunk.value);
			i++;
		}
		return chunks[index];
	}
	async function get_buffer(offset, length) {
		let start_chunk;
		let chunk_start = 0;
		let chunk_index;
		for (chunk_index = 0;; chunk_index++) {
			const chunk = await get_chunk(chunk_index);
			if (!chunk) return null;
			const chunk_end = chunk_start + chunk.byteLength;
			if (offset >= chunk_start && offset < chunk_end) {
				start_chunk = chunk;
				break;
			}
			chunk_start = chunk_end;
		}
		if (offset + length <= chunk_start + start_chunk.byteLength) return start_chunk.subarray(offset - chunk_start, offset + length - chunk_start);
		const buffer = new Uint8Array(length);
		buffer.set(start_chunk.subarray(offset - chunk_start));
		let cursor = start_chunk.byteLength - offset + chunk_start;
		while (cursor < length) {
			chunk_index++;
			let chunk = await get_chunk(chunk_index);
			if (!chunk) return null;
			if (chunk.byteLength > length - cursor) chunk = chunk.subarray(0, length - cursor);
			buffer.set(chunk, cursor);
			cursor += chunk.byteLength;
		}
		return buffer;
	}
	const header = await get_buffer(0, 7);
	if (!header) throw new Error("Could not deserialize binary form: too short");
	if (header[0] !== BINARY_FORM_VERSION) throw new Error(`Could not deserialize binary form: got version ${header[0]}, expected version ${BINARY_FORM_VERSION}`);
	const header_view = new DataView(header.buffer, header.byteOffset, header.byteLength);
	const data_length = header_view.getUint32(1, true);
	const file_offsets_length = header_view.getUint16(5, true);
	const data_buffer = await get_buffer(7, data_length);
	if (!data_buffer) throw new Error("Could not deserialize binary form: data too short");
	let file_offsets;
	let files_start_offset;
	if (file_offsets_length > 0) {
		const file_offsets_buffer = await get_buffer(7 + data_length, file_offsets_length);
		if (!file_offsets_buffer) throw new Error("Could not deserialize binary form: file offset table too short");
		file_offsets = JSON.parse(text_decoder.decode(file_offsets_buffer));
		files_start_offset = 7 + data_length + file_offsets_length;
	}
	const [data, meta] = devalue.parse(text_decoder.decode(data_buffer), { File: ([name, type, size, last_modified, index]) => {
		return new Proxy(new LazyFile(name, type, size, last_modified, get_chunk, files_start_offset + file_offsets[index]), { getPrototypeOf() {
			return File.prototype;
		} });
	} });
	(async () => {
		let has_more = true;
		while (has_more) has_more = !!await get_chunk(chunks.length);
	})();
	return {
		data,
		meta,
		form_data: null
	};
}
var LazyFile = class LazyFile {
	#get_chunk;
	#offset;
	constructor(name, type, size, last_modified, get_chunk, offset) {
		this.name = name;
		this.type = type;
		this.size = size;
		this.lastModified = last_modified;
		this.webkitRelativePath = "";
		this.#get_chunk = get_chunk;
		this.#offset = offset;
		this.arrayBuffer = this.arrayBuffer.bind(this);
		this.bytes = this.bytes.bind(this);
		this.slice = this.slice.bind(this);
		this.stream = this.stream.bind(this);
		this.text = this.text.bind(this);
	}
	#buffer;
	async arrayBuffer() {
		this.#buffer ??= await new Response(this.stream()).arrayBuffer();
		return this.#buffer;
	}
	async bytes() {
		return new Uint8Array(await this.arrayBuffer());
	}
	slice(start = 0, end = this.size, contentType = this.type) {
		if (start < 0) start = Math.max(this.size + start, 0);
		else start = Math.min(start, this.size);
		if (end < 0) end = Math.max(this.size + end, 0);
		else end = Math.min(end, this.size);
		const size = Math.max(end - start, 0);
		return new LazyFile(this.name, contentType, size, this.lastModified, this.#get_chunk, this.#offset + start);
	}
	stream() {
		let cursor = 0;
		let chunk_index = 0;
		return new ReadableStream({
			start: async (controller) => {
				let chunk_start = 0;
				let start_chunk = null;
				for (chunk_index = 0;; chunk_index++) {
					const chunk = await this.#get_chunk(chunk_index);
					if (!chunk) return null;
					const chunk_end = chunk_start + chunk.byteLength;
					if (this.#offset >= chunk_start && this.#offset < chunk_end) {
						start_chunk = chunk;
						break;
					}
					chunk_start = chunk_end;
				}
				if (this.#offset + this.size <= chunk_start + start_chunk.byteLength) {
					controller.enqueue(start_chunk.subarray(this.#offset - chunk_start, this.#offset + this.size - chunk_start));
					controller.close();
				} else {
					controller.enqueue(start_chunk.subarray(this.#offset - chunk_start));
					cursor = start_chunk.byteLength - this.#offset + chunk_start;
				}
			},
			pull: async (controller) => {
				chunk_index++;
				let chunk = await this.#get_chunk(chunk_index);
				if (!chunk) {
					controller.error("Could not deserialize binary form: incomplete file data");
					controller.close();
					return;
				}
				if (chunk.byteLength > this.size - cursor) chunk = chunk.subarray(0, this.size - cursor);
				controller.enqueue(chunk);
				cursor += chunk.byteLength;
				if (cursor >= this.size) controller.close();
			}
		});
	}
	async text() {
		return text_decoder.decode(await this.arrayBuffer());
	}
};
var path_regex = /^[a-zA-Z_$]\w*(\.[a-zA-Z_$]\w*|\[\d+\])*$/;
function split_path(path) {
	if (!path_regex.test(path)) throw new Error(`Invalid path ${path}`);
	return path.split(/\.|\[|\]/).filter(Boolean);
}
function check_prototype_pollution(key) {
	if (key === "__proto__" || key === "constructor" || key === "prototype") throw new Error(`Invalid key "${key}"`);
}
function deep_set(object, keys, value) {
	let current = object;
	for (let i = 0; i < keys.length - 1; i += 1) {
		const key = keys[i];
		check_prototype_pollution(key);
		const is_array = /^\d+$/.test(keys[i + 1]);
		const exists = Object.hasOwn(current, key);
		const inner = current[key];
		if (exists && is_array !== Array.isArray(inner)) throw new Error(`Invalid array key ${keys[i + 1]}`);
		if (!exists) current[key] = is_array ? [] : {};
		current = current[key];
	}
	const final_key = keys[keys.length - 1];
	check_prototype_pollution(final_key);
	current[final_key] = value;
}
function normalize_issue(issue, server = false) {
	const normalized = {
		name: "",
		path: [],
		message: issue.message,
		server
	};
	if (issue.path !== void 0) {
		let name = "";
		for (const segment of issue.path) {
			const key = typeof segment === "object" ? segment.key : segment;
			normalized.path.push(key);
			if (typeof key === "number") name += `[${key}]`;
			else if (typeof key === "string") name += name === "" ? key : "." + key;
		}
		normalized.name = name;
	}
	return normalized;
}
function flatten_issues(issues) {
	const result = {};
	for (const issue of issues) {
		(result.$ ??= []).push(issue);
		let name = "";
		if (issue.path !== void 0) for (const key of issue.path) {
			if (typeof key === "number") name += `[${key}]`;
			else if (typeof key === "string") name += name === "" ? key : "." + key;
			(result[name] ??= []).push(issue);
		}
	}
	return result;
}
function deep_get(object, path) {
	let current = object;
	for (const key of path) {
		if (current == null || typeof current !== "object") return current;
		current = current[key];
	}
	return current;
}
function create_field_proxy(target, get_input, set_input, get_issues, path = []) {
	const get_value = () => {
		return deep_get(get_input(), path);
	};
	return new Proxy(target, { get(target$1, prop) {
		if (typeof prop === "symbol") return target$1[prop];
		if (/^\d+$/.test(prop)) return create_field_proxy({}, get_input, set_input, get_issues, [...path, parseInt(prop, 10)]);
		const key = build_path_string(path);
		if (prop === "set") {
			const set_func = function(newValue) {
				set_input(path, newValue);
				return newValue;
			};
			return create_field_proxy(set_func, get_input, set_input, get_issues, [...path, prop]);
		}
		if (prop === "value") return create_field_proxy(get_value, get_input, set_input, get_issues, [...path, prop]);
		if (prop === "issues" || prop === "allIssues") {
			const issues_func = () => {
				const all_issues = get_issues()[key === "" ? "$" : key];
				if (prop === "allIssues") return all_issues?.map((issue) => ({
					path: issue.path,
					message: issue.message
				}));
				return all_issues?.filter((issue) => issue.name === key)?.map((issue) => ({
					path: issue.path,
					message: issue.message
				}));
			};
			return create_field_proxy(issues_func, get_input, set_input, get_issues, [...path, prop]);
		}
		if (prop === "as") {
			const as_func = (type, input_value) => {
				const is_array = type === "file multiple" || type === "select multiple" || type === "checkbox" && typeof input_value === "string";
				const base_props = {
					name: (type === "number" || type === "range" ? "n:" : type === "checkbox" && !is_array ? "b:" : "") + key + (is_array ? "[]" : ""),
					get "aria-invalid"() {
						return key in get_issues() ? "true" : void 0;
					}
				};
				if (type !== "text" && type !== "select" && type !== "select multiple") base_props.type = type === "file multiple" ? "file" : type;
				if (type === "submit" || type === "hidden") return Object.defineProperties(base_props, { value: {
					value: input_value,
					enumerable: true
				} });
				if (type === "select" || type === "select multiple") return Object.defineProperties(base_props, {
					multiple: {
						value: is_array,
						enumerable: true
					},
					value: {
						enumerable: true,
						get() {
							return get_value();
						}
					}
				});
				if (type === "checkbox" || type === "radio") return Object.defineProperties(base_props, {
					value: {
						value: input_value ?? "on",
						enumerable: true
					},
					checked: {
						enumerable: true,
						get() {
							const value = get_value();
							if (type === "radio") return value === input_value;
							if (is_array) return (value ?? []).includes(input_value);
							return value;
						}
					}
				});
				if (type === "file" || type === "file multiple") return Object.defineProperties(base_props, {
					multiple: {
						value: is_array,
						enumerable: true
					},
					files: {
						enumerable: true,
						get() {
							const value = get_value();
							if (value instanceof File) {
								if (typeof DataTransfer !== "undefined") {
									const fileList = new DataTransfer();
									fileList.items.add(value);
									return fileList.files;
								}
								return {
									0: value,
									length: 1
								};
							}
							if (Array.isArray(value) && value.every((f) => f instanceof File)) {
								if (typeof DataTransfer !== "undefined") {
									const fileList = new DataTransfer();
									value.forEach((file) => fileList.items.add(file));
									return fileList.files;
								}
								const fileListLike = { length: value.length };
								value.forEach((file, index) => {
									fileListLike[index] = file;
								});
								return fileListLike;
							}
							return null;
						}
					}
				});
				return Object.defineProperties(base_props, { value: {
					enumerable: true,
					get() {
						const value = get_value();
						return value != null ? String(value) : "";
					}
				} });
			};
			return create_field_proxy(as_func, get_input, set_input, get_issues, [...path, "as"]);
		}
		return create_field_proxy({}, get_input, set_input, get_issues, [...path, prop]);
	} });
}
function build_path_string(path) {
	let result = "";
	for (const segment of path) if (typeof segment === "number") result += `[${segment}]`;
	else result += result === "" ? segment : "." + segment;
	return result;
}
function throw_on_old_property_access(instance) {
	Object.defineProperty(instance, "field", { value: (name) => {
		const new_name = name.endsWith("[]") ? name.slice(0, -2) : name;
		throw new Error(`\`form.field\` has been removed: Instead of \`<input name={form.field('${name}')} />\` do \`<input {...form.fields.${new_name}.as(type)} />\``);
	} });
	for (const property of ["input", "issues"]) Object.defineProperty(instance, property, { get() {
		const new_name = property === "issues" ? "issues" : "value";
		return new Proxy({}, { get(_, prop) {
			const prop_string = typeof prop === "string" ? prop : String(prop);
			const old = prop_string.includes("[") || prop_string.includes(".") ? `['${prop_string}']` : `.${prop_string}`;
			const replacement = `.${prop_string}.${new_name}()`;
			throw new Error(`\`form.${property}\` has been removed: Instead of \`form.${property}${old}\` write \`form.fields${replacement}\``);
		} });
	} });
}
export { flatten_issues as a, throw_on_old_property_access as c, deserialize_binary_form as i, create_field_proxy as n, normalize_issue as o, deep_set as r, set_nested_value as s, BINARY_FORM_CONTENT_TYPE as t };
