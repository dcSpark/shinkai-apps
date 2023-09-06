import { InboxNameWrapper } from "./InboxNameWrapper";
import { test } from "vitest";

test("InboxNameWrapper", () => {
  const validNames = [
    "inbox::@@node.shinkai::true",
    "inbox::@@node1.shinkai/subidentity::false",
    "inbox::@@alice.shinkai/profileName/agent/myChatGPTAgent::true",
    "inbox::@@alice.shinkai/profileName/device/myPhone::true",
    "inbox::@@node1.shinkai/subidentity::@@node2.shinkai/subidentity2::false",
    "inbox::@@node1.shinkai/subidentity::@@node2.shinkai/subidentity::@@node3.shinkai/subidentity2::false",
  ];

  const invalidNames = [
    "@@node1.shinkai::false",
    "inbox::@@node1.shinkai::falsee",
    "@@node1.shinkai",
    "inbox::@@node1.shinkai",
    "inbox::node1::false",
    "inbox::node1.shinkai::false",
    "inbox::@@node1::false",
    "inbox::@@node1.shinkai//subidentity::@@node2.shinkai::false",
    "inbox::@@node1/subidentity::false",
  ];

  for (const name of validNames) {
    const wrapper = new InboxNameWrapper(name);
    expect(wrapper.get_value).toBe(name.toLowerCase());
  }

  for (const name of invalidNames) {
    expect(() => new InboxNameWrapper(name)).toThrow();
  }
});

test("InboxNameWrapper get_identities", () => {
  const namesWithIdentities = [
    {
      name: "inbox::@@alice.shinkai/profileName::true",
      identity: "@@alice.shinkai/profileName",
    },
    {
      name: "inbox::@@alice.shinkai/profileName/agent/myChatGPTAgent::true",
      identity: "@@alice.shinkai/profilename/agent/mychatgptagent",
    },
    {
      name: "inbox::@@alice.shinkai/profileName/device/myPhone::true",
      identity: "@@alice.shinkai/profilename/device/myphone",
    },
  ];

  for (const { name, identity } of namesWithIdentities) {
    const wrapper = new InboxNameWrapper(name);
    expect(wrapper.get_identities).toStrictEqual([identity.toLowerCase()]);
  }
});

test("InboxNameWrapper get_regular_inbox_name_from_params", () => {
  const params = [
    {
      sender: "@@alice.shinkai",
      sender_subidentity: "profileName",
      recipient: "@@bob.shinkai",
      recipient_subidentity: "profileName",
      is_e2e: true,
      expected: "inbox::@@alice.shinkai/profilename::@@bob.shinkai/profilename::true",
    },
  ];

  for (const { sender, sender_subidentity, recipient, recipient_subidentity, is_e2e, expected } of params) {
    const wrapper = InboxNameWrapper.get_regular_inbox_name_from_params(sender, sender_subidentity, recipient, recipient_subidentity, is_e2e);
    expect(wrapper.get_value).toBe(expected.toLowerCase());
  }
});

test("InboxNameWrapper get_job_inbox_name_from_params", () => {
  const params = [
    {
      unique_id: "123",
      expected: "job_inbox::123::false",
    },
  ];

  for (const { unique_id, expected } of params) {
    const wrapper = InboxNameWrapper.get_job_inbox_name_from_params(unique_id);
    expect(wrapper.get_value).toBe(expected.toLowerCase());
  }
});