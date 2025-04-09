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
var resend_1 = require("resend");
var resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_Hywa1czp_PV64Ygb6F5o43CmUjSoMnmxc');
var SENDER_EMAIL = 'onboarding@resend.dev';
function sendApplicationConfirmation(application, job, referenceId) {
    return __awaiter(this, void 0, void 0, function () {
        var applicantName, subject, htmlBody, _a, data, error, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    applicantName = application.firstName + " " + application.lastName;
                    subject = "Your Application for " + job.title + " at 7-Eleven has been received";
                    htmlBody = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;\">\n        <div style=\"text-align: center; margin-bottom: 20px;\">\n          <div style=\"font-size: 24px; font-weight: bold;\">\n            <span style=\"color: #008c48;\">7-ELEVEN</span>\n            <span style=\"color: #ff7a00; margin-left: 5px;\">PHILIPPINES</span>\n          </div>\n        </div>\n        \n        <h2 style=\"color: #333; text-align: center;\">Application Confirmation</h2>\n        \n        <p>Dear " + applicantName + ",</p>\n        \n        <p>Thank you for applying to the <strong>" + job.title + "</strong> position at 7-Eleven " + job.location + ". We have received your application and our team will review it shortly.</p>\n        \n        <div style=\"background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;\">\n          <p style=\"margin: 0;\"><strong>Application Reference ID:</strong> " + referenceId + "</p>\n          <p style=\"margin: 10px 0 0;\"><strong>Position:</strong> " + job.title + "</p>\n          <p style=\"margin: 10px 0 0;\"><strong>Location:</strong> " + job.location + "</p>\n          <p style=\"margin: 10px 0 0;\"><strong>Date Applied:</strong> " + new Date().toLocaleDateString() + "</p>\n        </div>\n        \n        <p>What happens next?</p>\n        <ol>\n          <li>Our hiring team will review your application</li>\n          <li>If your qualifications match our requirements, we'll contact you for an interview</li>\n          <li>You will receive updates on your application status via email</li>\n        </ol>\n        \n        <p>Please save your application reference ID for future correspondence.</p>\n        \n        <p>If you have any questions about your application, please contact our HR department.</p>\n        \n        <p>Best regards,<br>\n        7-Eleven Philippines Recruitment Team</p>\n        \n        <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;\">\n          <p>This is an automated message. Please do not reply to this email.</p>\n        </div>\n      </div>\n    ";
                    return [4 /*yield*/, resend.emails.send({
                            from: SENDER_EMAIL,
                            to: application.email,
                            subject: subject,
                            html: htmlBody
                        })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Resend API error:", error);
                        throw new Error("Email sending failed: " + error.message);
                    }
                    console.log("Email sent successfully, ID:", data === null || data === void 0 ? void 0 : data.id);
                    return [2 /*return*/, {
                            success: true,
                            messageId: (data === null || data === void 0 ? void 0 : data.id) || 'unknown'
                        }];
                case 2:
                    error_1 = _b.sent();
                    console.error("Error sending application confirmation email:", error_1);
                    return [2 /*return*/, {
                            success: false,
                            error: error_1.message
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendApplicationConfirmation = sendApplicationConfirmation;
function sendStatusUpdateEmail(application, job, status, referenceId) {
    return __awaiter(this, void 0, void 0, function () {
        var applicantName, statusMap, statusText, subject, statusMessage, nextSteps, htmlBody, _a, data, error, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
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
                    statusMessage = "";
                    nextSteps = "";
                    if (status === "under_review") {
                        statusMessage = "Your application is currently under review by our hiring team.";
                        nextSteps = "If your qualifications match our requirements, we will contact you for an interview.";
                    }
                    else if (status === "interview") {
                        statusMessage = "Congratulations! Your application has been selected for an interview.";
                        nextSteps = "Our HR team will contact you shortly to schedule an interview.";
                    }
                    else if (status === "interviewed") {
                        statusMessage = "Thank you for attending the interview for this position.";
                        nextSteps = "Our team is currently evaluating all candidates and we will inform you of our decision soon.";
                    }
                    else if (status === "accepted") {
                        statusMessage = "Congratulations! We are pleased to inform you that your application has been accepted.";
                        nextSteps = "Our HR team will contact you shortly with more details about the next steps.";
                    }
                    else if (status === "rejected") {
                        statusMessage = "Thank you for your interest in the position. After careful consideration, we have decided to proceed with other candidates whose qualifications more closely match our current needs.";
                        nextSteps = "We encourage you to apply for future positions that match your skills and experience.";
                    }
                    else {
                        statusMessage = "Your application status has been updated to: " + statusText;
                        nextSteps = "Please continue to monitor your email for further updates.";
                    }
                    htmlBody = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;\">\n        <div style=\"text-align: center; margin-bottom: 20px;\">\n          <div style=\"font-size: 24px; font-weight: bold;\">\n            <span style=\"color: #008c48;\">7-ELEVEN</span>\n            <span style=\"color: #ff7a00; margin-left: 5px;\">PHILIPPINES</span>\n          </div>\n        </div>\n        \n        <h2 style=\"color: #333; text-align: center;\">Application Status Update</h2>\n        \n        <p>Dear " + applicantName + ",</p>\n        \n        <p>" + statusMessage + "</p>\n        \n        <div style=\"background-color: #f9f9f9; border-left: 4px solid #008c48; padding: 15px; margin: 20px 0;\">\n          <p style=\"margin: 0;\"><strong>Application Reference ID:</strong> " + referenceId + "</p>\n          <p style=\"margin: 10px 0 0;\"><strong>Position:</strong> " + job.title + "</p>\n          <p style=\"margin: 10px 0 0;\"><strong>Location:</strong> " + job.location + "</p>\n          <p style=\"margin: 10px 0 0;\"><strong>Current Status:</strong> " + statusText + "</p>\n        </div>\n        \n        <p>" + nextSteps + "</p>\n        \n        <p>If you have any questions, please contact our HR department and reference your Application ID.</p>\n        \n        <p>Best regards,<br>\n        7-Eleven Philippines Recruitment Team</p>\n        \n        <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;\">\n          <p>This is an automated message. Please do not reply to this email.</p>\n        </div>\n      </div>\n    ";
                    return [4 /*yield*/, resend.emails.send({
                            from: SENDER_EMAIL,
                            to: application.email,
                            subject: subject,
                            html: htmlBody
                        })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Resend API error:", error);
                        throw new Error("Email sending failed: " + error.message);
                    }
                    console.log("Status update email sent successfully, ID:", data === null || data === void 0 ? void 0 : data.id);
                    return [2 /*return*/, {
                            success: true,
                            messageId: (data === null || data === void 0 ? void 0 : data.id) || 'unknown'
                        }];
                case 2:
                    error_2 = _b.sent();
                    console.error("Error sending status update email:", error_2);
                    return [2 /*return*/, {
                            success: false,
                            error: error_2.message
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendStatusUpdateEmail = sendStatusUpdateEmail;
function sendTestEmail(to) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, resend.emails.send({
                            from: SENDER_EMAIL,
                            to: to,
                            subject: 'Test Email from 7-Eleven Application System',
                            html: '<p>This is a test email from the 7-Eleven application system.</p><p>If you received this, email sending is working correctly!</p>'
                        })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        return [2 /*return*/, { success: false, error: error.message }];
                    }
                    return [2 /*return*/, { success: true, messageId: data === null || data === void 0 ? void 0 : data.id }];
                case 2:
                    error_3 = _b.sent();
                    return [2 /*return*/, { success: false, error: error_3.message }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendTestEmail = sendTestEmail;
