const puppeteer = require("puppeteer");
const sessionFactory = require("./../factories/sessionFactory");
const userFactory = require("./../factories/userFactory");

class Page {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
    const testPage = new Page(page);
    return new Proxy(testPage, {
      get(target, property) {
        return testPage[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
    this.logoutLinkSelector = 'a[href="/auth/logout"]';
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    await this.page.goto("localhost:3000/blogs");
    await this.page.waitFor(this.logoutLinkSelector);
  }

  async getContentOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = Page;
