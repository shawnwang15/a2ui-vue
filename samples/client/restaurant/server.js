var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
import { v4 as uuidv4 } from 'uuid';
import { A2AClient } from '@a2a-js/sdk/client';
var client = null;
export function createA2AMiddleware() {
    var _this = this;
    return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var originalBody;
        var _this = this;
        return __generator(this, function (_a) {
            // Only handle POST requests to /a2a
            if (req.method !== 'POST' || req.url !== '/a2a') {
                return [2 /*return*/, next()];
            }
            originalBody = '';
            req.on('data', function (chunk) {
                originalBody += chunk.toString();
            });
            req.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                var sendParams, clientEvent, client_1, response, result, error_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (isJson(originalBody)) {
                                console.log('[a2a-middleware] Received JSON UI event:', originalBody);
                                clientEvent = JSON.parse(originalBody);
                                sendParams = {
                                    message: {
                                        messageId: uuidv4(),
                                        role: 'user',
                                        parts: [
                                            {
                                                kind: 'data',
                                                data: clientEvent,
                                                metadata: { 'mimeType': 'application/json+a2ui' },
                                            },
                                        ],
                                        kind: 'message',
                                    },
                                };
                            }
                            else {
                                console.log('[a2a-middleware] Received text query:', originalBody);
                                sendParams = {
                                    message: {
                                        messageId: uuidv4(),
                                        role: 'user',
                                        parts: [{ kind: 'text', text: originalBody }],
                                        kind: 'message',
                                    },
                                };
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, createOrGetClient()];
                        case 2:
                            client_1 = _b.sent();
                            return [4 /*yield*/, client_1.sendMessage(sendParams)];
                        case 3:
                            response = _b.sent();
                            res.setHeader('Cache-Control', 'no-store');
                            res.setHeader('Content-Type', 'application/json');
                            if ('error' in response) {
                                console.error('Error:', response.error.message);
                                res.statusCode = 500;
                                res.end(JSON.stringify({ error: response.error.message }));
                                return [2 /*return*/];
                            }
                            result = response.result;
                            res.end(JSON.stringify(result.kind === 'task' ? ((_a = result.status.message) === null || _a === void 0 ? void 0 : _a.parts) || [] : []));
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _b.sent();
                            console.error('Error handling request:', error_1);
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ error: String(error_1) }));
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); };
}
function fetchWithCustomHeader(url, init) {
    return __awaiter(this, void 0, void 0, function () {
        var headers, newInit;
        return __generator(this, function (_a) {
            headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
            headers.set('X-A2A-Extensions', 'https://a2ui.org/a2a-extension/a2ui/v0.9');
            newInit = __assign(__assign({}, init), { headers: headers });
            return [2 /*return*/, fetch(url, newInit)];
        });
    });
}
function createOrGetClient() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(
                    // Create a client pointing to the agent's Agent Card URL.
                    client !== null && 
                    // Create a client pointing to the agent's Agent Card URL.
                    client !== void 0)) return [3 /*break*/, 1];
                    // Create a client pointing to the agent's Agent Card URL.
                    _a = client;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, A2AClient.fromCardUrl('http://localhost:10002/.well-known/agent-card.json', {
                        fetchImpl: fetchWithCustomHeader,
                    })];
                case 2:
                    _a = (
                    // Create a client pointing to the agent's Agent Card URL.
                    client = _b.sent());
                    _b.label = 3;
                case 3:
                    // Create a client pointing to the agent's Agent Card URL.
                    _a;
                    return [2 /*return*/, client];
            }
        });
    });
}
function isJson(str) {
    try {
        var parsed = JSON.parse(str);
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
    }
    catch (err) {
        console.warn(err);
        return false;
    }
}
