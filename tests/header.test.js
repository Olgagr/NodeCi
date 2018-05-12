const Page = require("./hepers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("the header has the correct logo text", async () => {
  const text = await page.getContentOf("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when signed in, shows logout button", async () => {
  await page.login();
  const logoutText = await page.getContentOf(page.logoutLinkSelector);
  expect(logoutText).toEqual("Logout");
});
