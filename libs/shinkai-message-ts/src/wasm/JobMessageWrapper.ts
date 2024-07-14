/* eslint-disable @typescript-eslint/no-explicit-any */

import { JobMessageWrapper as JobMessageWrapperWASM } from '../pkg/shinkai_message_wasm.js';

export class JobMessageWrapper {
  private wasmWrapper: JobMessageWrapperWASM;

  constructor(
    job_id_js: any,
    content_js: any,
    files_inbox_js: any,
    parent: any,
    workflow_code: any,
  ) {
    this.wasmWrapper = new JobMessageWrapperWASM(
      job_id_js,
      content_js,
      files_inbox_js,
      parent,
      workflow_code,
      undefined, // workflow_name
    );
  }

  to_jsvalue(): any {
    return this.wasmWrapper.to_jsvalue();
  }

  to_json_str(): string {
    return this.wasmWrapper.to_json_str();
  }

  static from_json_str(s: string): JobMessageWrapper {
    const js_value = JSON.parse(s);
    return new JobMessageWrapper(
      js_value.job_id_js,
      js_value.content_js,
      js_value.files_inbox_js,
      js_value.parent_js,
      js_value.workflow_js,
    );
  }

  static from_jsvalue(js_value: any): JobMessageWrapper {
    return new JobMessageWrapper(
      js_value.job_id_js,
      js_value.content_js,
      js_value.files_inbox_js,
      js_value.parent_js,
      js_value.workflow_js,
    );
  }

  static fromStrings(job_id: string, content: string): JobMessageWrapper {
    return new JobMessageWrapper(job_id, content, [], '', undefined);
  }

  static fromStringsWithFileInbox(
    job_id: string,
    content: string,
    file_inbox: string,
    parent: string,
    workflow: string,
  ): JobMessageWrapper {
    return new JobMessageWrapper(job_id, content, file_inbox, parent, workflow);
  }

  free(): void {
    this.wasmWrapper.free();
  }
}
