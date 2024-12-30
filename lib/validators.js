import { body, param, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";


const validateHandler = (req, res, next) => {
  const errors = validationResult(req);
  const errorMessages = errors
    .array()
    .map((error) => error.msg)
    .join(", ");
  if (errors.isEmpty()) return next();
  else next(new ErrorHandler(errorMessages, 400));
};


const chatIdValidator = () => [param("id", "Please Enter Chat ID").notEmpty()];
const sendMessageValidator = () => [
  body("chatId", "Please Enter Chat ID").notEmpty(),
  body("content", "Please Enter Message Content").notEmpty(),
];
const registerValidator = () => [
  body("name", "Please Enter Name").notEmpty(),
  body("username", "Please Enter Username").notEmpty(),
  body("bio", "Please Enter Bio").notEmpty(),
  body("password", "Please Enter Password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("email", "Please Enter a Valid Email").isEmail(),
];

const loginValidator = () => [
  body("email", "Please Enter a Valid Email").isEmail(),
  body("password", "Please Enter Password").notEmpty(),
];


export {
  chatIdValidator,
  sendMessageValidator,
  registerValidator,
  validateHandler,
  loginValidator
};
