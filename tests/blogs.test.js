const Page = require("./hepers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("when logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('.btn-floating[href="/blogs/new"]');
  });

  test("user can see a create post form", async () => {
    const url = await page.url();
    expect(url).toMatch(/\/blogs\/new/);

    const titleInput = await page.$('.title input[name="title"]');
    const contentInput = await page.$('.content input[name="content"]');
    expect(titleInput).not.toBeNull();
    expect(contentInput).not.toBeNull();
  });

  test("user can cancel to create a new blog post", async () => {
    const cancelBtnSelector = 'form a[href="/blogs"]';
    const cancelBtn = await page.$(cancelBtnSelector);
    expect(cancelBtn).not.toBeNull();

    await page.click(cancelBtnSelector);
    const url = await page.url();
    expect(url).toMatch(/\/blogs$/);
  });

  describe("when using valid inputs", async () => {
    beforeEach(async () => {
      await page.type('.title input[name="title"]', "My title");
      await page.type('.content input[name="content"]', "My content");
      await page.click('form button[type="submit"]');
    });

    test("subbmiting takes user to review screen", async () => {
      const headerContent = await page.getContentOf("h5");
      expect(headerContent).toEqual("Please confirm your entries");
    });

    test("saving adds blog post to the list of blogs", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const url = await page.url();
      expect(url).toMatch(/\/blogs$/);

      const title = await page.getContentOf(".card-title");
      const content = await page.getContentOf(".card-content p");
      expect(title).toBe("My title");
      expect(content).toBe("My content");
    });
  });

  describe("when using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click('form button[type="submit"]');
    });

    test("the form shows an error message", async () => {
      const titleError = await page.getContentOf(".title .red-text");
      const contentError = await page.getContentOf(".content .red-text");
      expect(titleError).toBe("You must provide a value");
      expect(contentError).toBe("You must provide a value");
    });
  });
});

describe("when not logged in", async () => {
  test("user cannot create blog post", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: "My title", content: "Some content" })
      }).then(res => res.json());
    });
    expect(result).toEqual({ error: "You must log in!" });
  });

  test("user cannot retrieve list of blog posts", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => res.json());
    });
    expect(result).toEqual({ error: "You must log in!" });
  });
});
