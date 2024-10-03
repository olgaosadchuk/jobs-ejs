const { app } = require("../app"); 
const { factory } = require("../util/seed_db");
const faker = require("@faker-js/faker");
const get_chai = require("../util/get_chai");
const http = require("http");
const User = require("../models/User");

describe("tests for registration and logon", function () {
  let server;
  let csrfToken;
  let csrfCookie;
  let sessionCookie;
  let user;

  // Start the server before any tests run
  before((done) => {
    server = http.createServer(app).listen(5000, done); // Create and start the server
  });

  // Close the server after all tests have finished
  after((done) => {
    server.close(done); // Close the server
  });

  it("should get the registration page", async () => {
    const { expect, request } = await get_chai();
    const req = request(app).get("/session/register").send();
    const res = await req;
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("Enter your name");

    // Extract CSRF token
    const textNoLineEnd = res.text.replaceAll("\n", "");
    const csrfTokenMatch = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
    expect(csrfTokenMatch).to.not.be.null;
    csrfToken = csrfTokenMatch[1];

    // Extract CSRF cookie
    const cookies = res.headers["set-cookie"];
    csrfCookie = cookies.find((element) => element.startsWith("csrfToken"));
    expect(csrfCookie).to.not.be.undefined;
  });

  it("should register the user", async () => {
    const { expect, request } = await get_chai();
    const password = faker.internet.password();
    user = await factory.build("user", { password });

    const dataToPost = {
      name: user.name,
      email: user.email,
      password,
      password1: password,
      _csrf: csrfToken,
    };

    const req = request(app)
      .post("/session/register")
      .set("Cookie", csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(dataToPost);

    const res = await req;
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("Jobs List");

    const newUser = await User.findOne({ email: user.email });
    expect(newUser).to.not.be.null;
  });

  it("should log the user on", async () => {
    const dataToPost = {
      email: user.email,
      password: user.password,
      _csrf: csrfToken,
    };
    const { expect, request } = await get_chai();
    const req = request
      .execute(app)
      .post("/session/logon")
      .set("Cookie", csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);
    const res = await req;
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal("/");

    // Extract session cookie
    const cookies = res.headers["set-cookie"];
    sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid")
    );
    expect(sessionCookie).to.not.be.undefined;
  });

  it("should log the user off", async () => {
    const { expect, request } = await get_chai();
    const dataToPost = { _csrf: csrfToken };

    const req = request(app)
      .post("/session/logoff")
      .set("Cookie", csrfCookie + ";" + sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(dataToPost);

    const res = await req;
    expect(res).to.have.status(200);
    expect(res.text).to.include("link to logon");
  });
});