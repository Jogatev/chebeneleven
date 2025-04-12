"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.sendTestEmail = exports.sendStatusUpdateEmail = exports.sendApplicationConfirmation = void 0;
// Brevo Mail Service
var nodemailer_1 = require("nodemailer");
var axios_1 = require("axios");
// SMTP Configuration for Brevo
var smtpTransport = nodemailer_1["default"].createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: '8a3c5a001@smtp-brevo.com',
        pass: '73kHjzqSK8YL6Fas'
    }
});
// API Configuration for Brevo
var BREVO_API_KEY = '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';
var BREVO_API_URL = 'https://api.brevo.com/v3';
var SENDER_EMAIL = 'careers@cheebeeneeleebeen.online';
var SENDER_NAME = '7-Eleven Philippines Recruitment';
// Logging functions
function logEmailAttempt(to, subject) {
    console.log("\uD83D\uDCE7 Sending email: \"" + subject + "\" to " + to);
}
function logEmailSuccess(to, messageId) {
    console.log("\u2705 Email sent to " + to + " | Message ID: " + messageId);
}
function logEmailError(to, error) {
    console.error("\u274C Email failed to " + to + ":", error);
}
// Choose which method to use - SMTP or API
// Set to 'smtp' or 'api'
var EMAIL_METHOD = 'smtp';
/**
 * Send email using Brevo SMTP
 */
function sendEmailSMTP(to, subject, htmlContent) {
    return __awaiter(this, void 0, void 0, function () {
        var mailOptions, info, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    mailOptions = {
                        from: "\"" + SENDER_NAME + "\" <" + SENDER_EMAIL + ">",
                        to: to,
                        subject: subject,
                        html: htmlContent
                    };
                    return [4 /*yield*/, smtpTransport.sendMail(mailOptions)];
                case 1:
                    info = _a.sent();
                    return [2 /*return*/, { success: true, messageId: info.messageId }];
                case 2:
                    error_1 = _a.sent();
                    console.error('SMTP sending error:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send email using Brevo API
 */
function sendEmailAPI(to, subject, htmlContent) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1["default"].post(BREVO_API_URL + "/smtp/email", {
                            sender: {
                                name: SENDER_NAME,
                                email: SENDER_EMAIL
                            },
                            to: [{ email: to }],
                            subject: subject,
                            htmlContent: htmlContent
                        }, {
                            headers: {
                                'api-key': BREVO_API_KEY,
                                'Content-Type': 'application/json'
                            }
                        })];
                case 1:
                    response = _d.sent();
                    return [2 /*return*/, { success: true, messageId: ((_a = response.data) === null || _a === void 0 ? void 0 : _a.messageId) || 'sent' }];
                case 2:
                    error_2 = _d.sent();
                    console.error('API sending error:', ((_b = error_2.response) === null || _b === void 0 ? void 0 : _b.data) || error_2);
                    throw ((_c = error_2.response) === null || _c === void 0 ? void 0 : _c.data) || error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send an email using the configured method (SMTP or API)
 */
function sendEmail(to, subject, htmlContent) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (EMAIL_METHOD === 'smtp') {
                return [2 /*return*/, sendEmailSMTP(to, subject, htmlContent)];
            }
            else {
                return [2 /*return*/, sendEmailAPI(to, subject, htmlContent)];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Send application confirmation email
 */
function sendApplicationConfirmation(application, job, referenceId) {
    return __awaiter(this, void 0, void 0, function () {
        var applicantName, subject, htmlBody, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    applicantName = application.firstName + " " + application.lastName;
                    subject = "Your Application for " + job.title + " at 7-Eleven has been received";
                    logEmailAttempt(application.email, subject);
                    htmlBody = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;\">\n        <div style=\"text-align: center; margin-bottom: 20px;\">\n          <div style=\"font-size: 24px; font-weight: bold;\">\n            <span style=\"color: #008c48;\">7-ELEVEN</span>\n            <span style=\"color: #ff7a00;\">PHILIPPINES</span>\n          </div>\n        </div>\n        <h2 style=\"text-align: center;\">Application Confirmation</h2>\n        <p>Dear " + applicantName + ",</p>\n        <p>Thank you for applying to the <strong>" + job.title + "</strong> position at 7-Eleven " + job.location + ". We have received your application and our team will review it shortly.</p>\n        <div style=\"background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;\">\n          <p><strong>Reference ID:</strong> " + referenceId + "</p>\n          <p><strong>Position:</strong> " + job.title + "</p>\n          <p><strong>Location:</strong> " + job.location + "</p>\n          <p><strong>Date Applied:</strong> " + new Date().toLocaleDateString() + "</p>\n        </div>\n        <p>What happens next?</p>\n        <ol>\n          <li>Application review by our team</li>\n          <li>Possible interview invitation if you meet qualifications</li>\n          <li>Status updates via email</li>\n        </ol>\n        <p>Please keep your reference ID safe.</p>\n        <p>For inquiries, contact our HR team.</p>\n        <p>Best regards,<br>7-Eleven Philippines Recruitment Team</p>\n        <div style=\"text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;\">\n          <p>This is an automated message. Do not reply.</p>\n        </div>\n      </div>\n    ";
                    return [4 /*yield*/, sendEmail(application.email, subject, htmlBody)];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        logEmailSuccess(application.email, result.messageId);
                        return [2 /*return*/, { success: true, messageId: result.messageId || 'unknown' }];
                    }
                    else {
                        throw new Error("Email sending failed: " + result.error);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error("❌ Error in sendApplicationConfirmation:", error_3);
                    return [2 /*return*/, { success: false, error: error_3.message }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendApplicationConfirmation = sendApplicationConfirmation;
/**
 * Send status update email
 */
function sendStatusUpdateEmail(application, job, status, referenceId) {
    return __awaiter(this, void 0, void 0, function () {
        var applicantName, statusMap, statusText, subject, statusMessage, nextSteps, htmlBody, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    applicantName = application.firstName + " " + application.lastName;
                    statusMap = {
                        submitted: "Submitted",
                        under_review: "Under Review",
                        interview: "Selected for Interview",
                        interviewed: "Interviewed",
                        accepted: "Accepted",
                        rejected: "Not Selected"
                    };
                    statusText = statusMap[status] || status;
                    subject = "Your 7-Eleven Job Application Status: " + statusText;
                    logEmailAttempt(application.email, subject);
                    statusMessage = {
                        under_review: "Your application is currently under review by our hiring team.",
                        interview: "Congratulations! Your application has been selected for an interview.",
                        interviewed: "Thank you for attending the interview. We're evaluating all candidates.",
                        accepted: "Congratulations! Your application has been accepted.",
                        rejected: "Thank you for applying. We've decided to proceed with other candidates."
                    }[status] || "Your application status is now: " + statusText;
                    nextSteps = {
                        under_review: "We'll contact you if you're shortlisted.",
                        interview: "Our HR team will schedule your interview.",
                        interviewed: "Please wait for our decision.",
                        accepted: "We'll follow up shortly with the next steps.",
                        rejected: "We encourage you to apply for future openings."
                    }[status] || "Check your email for further updates.";
                    htmlBody = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;\">\n        <div style=\"text-align: center; margin-bottom: 20px;\">\n          <div style=\"font-size: 24px; font-weight: bold;\">\n            <span style=\"color: #008c48;\">7-ELEVEN</span>\n            <span style=\"color: #ff7a00;\">PHILIPPINES</span>\n          </div>\n        </div>\n        <h2 style=\"text-align: center;\">Application Status Update</h2>\n        <p>Dear " + applicantName + ",</p>\n        <p>" + statusMessage + "</p>\n        <div style=\"background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;\">\n          <p><strong>Reference ID:</strong> " + referenceId + "</p>\n          <p><strong>Position:</strong> " + job.title + "</p>\n          <p><strong>Location:</strong> " + job.location + "</p>\n          <p><strong>Status:</strong> " + statusText + "</p>\n        </div>\n        <p>" + nextSteps + "</p>\n        <p>For inquiries, contact our HR team with your Reference ID.</p>\n        <p>Best regards,<br>7-Eleven Philippines Recruitment Team</p>\n        <div style=\"text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;\">\n          <p>This is an automated message. Do not reply.</p>\n        </div>\n      </div>\n    ";
                    return [4 /*yield*/, sendEmail(application.email, subject, htmlBody)];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        logEmailSuccess(application.email, result.messageId);
                        return [2 /*return*/, { success: true, messageId: result.messageId || 'unknown' }];
                    }
                    else {
                        throw new Error("Email sending failed: " + result.error);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error("❌ Error in sendStatusUpdateEmail:", error_4);
                    return [2 /*return*/, { success: false, error: error_4.message }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendStatusUpdateEmail = sendStatusUpdateEmail;
/**
 * Send test email
 */
function sendTestEmail(to) {
    return __awaiter(this, void 0, void 0, function () {
        var subject, html, result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    subject = 'Test Email from 7-Eleven Application System';
                    logEmailAttempt(to, subject);
                    html = "\n      <p>This is a test email from the 7-Eleven application system.</p>\n      <p>If you received this, your email setup is working correctly!</p>\n    ";
                    return [4 /*yield*/, sendEmail(to, subject, html)];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        logEmailSuccess(to, result.messageId);
                        return [2 /*return*/, { success: true, messageId: result.messageId }];
                    }
                    else {
                        throw new Error("Email sending failed: " + result.error);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error("❌ Error in sendTestEmail:", error_5);
                    return [2 /*return*/, { success: false, error: error_5.message }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendTestEmail = sendTestEmail;
