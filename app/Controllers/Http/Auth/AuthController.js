"use strict";

// @ts-ignore
const User = use("App/Models/User");
const uuid = require("uuid/v4");
const { validate } = use('Validator');
const RegisterValidation = use("App/Validators/RegisterValidation");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with auths
 */
class AuthController {
  /**
   * Create/save a new auth.
   * POST auths
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  // @ts-ignore
  async register({ request, auth, response }) {
    try {
      //getting data passed within the request
      const data = request.only(["name", "email", "password"]);
      const validation = validate(data, RegisterValidation.rules, RegisterValidation.message);

      let dataUser = {
        id: uuid(),
        name: data.name,
        email: data.email,
        password: data.password,
        status: 1,
        is_main: 1,
      };

      const user = await User.create(dataUser);

      // @ts-ignore
      let accessToken = await auth.generate(user);
      return response.status(200).send({
        status: 200,
        object: "register",
        url: request.originalUrl(),
        message: "Successed register new user",
      });
    } catch (err) {
      return response.status(err.status).send(err);
    }
  }

  /**
   * Login auth.
   * POST auths
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  // @ts-ignore
  async login({ request, auth, response }) {
    try {
      //getting data passed within the request
      const data = request.only(["email", "password"]);

      if (
        await auth
          .authenticator("jwt")
          .withRefreshToken()
          .attempt(data.email, data.password)
      ) {
        let user = await User.findBy("email", data.email);
        let accessToken = await auth
          .withRefreshToken()
          .attempt(data.email, data.password);

        return response.status(200).send({
          status: 200,
          message: "Succesfully Login",
          user: user,
          access_token: accessToken,
        });
      }
    } catch (err) {
      return response.status(err.status).send(err);
    }
  }
}

module.exports = AuthController;
