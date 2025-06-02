(function () {
    // URL change detection
    const setupUrlChangeDetection = () => {
        const detectUrlChange = () => {
            let currentUrl = document.location.href;
            const body = document.querySelector("body");

            const observer = new MutationObserver(() => {
                if (currentUrl !== document.location.href) {
                    currentUrl = document.location.href;
                    if (window.top) {
                        window.top.postMessage({
                            type: "URL_CHANGED",
                            url: document.location.href,
                            path: document.location.pathname
                        }, "*");
                    }
                }
            });

            if (body) {
                observer.observe(body, { childList: true, subtree: true });
            }
        };

        window.addEventListener("load", detectUrlChange);
        window.addEventListener("popstate", () => {
            if (window.top) {
                window.top.postMessage({
                    type: "URL_CHANGED",
                    url: document.location.href,
                    path: document.location.pathname
                }, "*");
            }
        });
    };
    // Constants
    const CONSTANTS = {
        ALLOWED_ORIGINS: ["*"],
        DEBOUNCE_DELAY: 10,
        Z_INDEX: 10000,
        TOOLTIP_OFFSET: 25,
        MAX_TOOLTIP_WIDTH: 200,
        SCROLL_DEBOUNCE: 420
    };

    // Extract path from URL helper function (used throughout the script)
    const extractPathFromUrl = (url) => {
        if (!url) return null;

        try {
            // Handle relative URLs by prepending origin
            const fullUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).href;
            const urlObj = new URL(fullUrl);
            return urlObj.pathname;
        } catch (e) {
            console.warn("Failed to extract path from URL:", url, e);
            return null;
        }
    };

    // Send message to parent window
    const sendMessageToParent = (message) => {
        try {
            if (!window.parent) return;
            if (!message || typeof message !== "object") {
                console.error("Invalid message format");
                return;
            }
            window.parent.postMessage(message, "*");
        } catch (error) {
            console.error(`Failed to send message:`, error);
        }
    };
    // Wait for DOM to be ready
    const waitForDomReady = () => {
        return new Promise(resolve => {
            if (document.readyState !== "loading") {
                resolve();
                return;
            }

            document.addEventListener('DOMContentLoaded', () => {
                resolve();
            });
        });
    };
    // Wait for React root to be ready
    const waitForReactRoot = () => {
        return new Promise(resolve => {
            const root = document.getElementById("root") || document.getElementById("__next");
            if (root && root.children.length > 0) {
                resolve();
                return;
            }

            new MutationObserver((mutations, observer) => {
                const root = document.getElementById("root") || document.getElementById("__next");
                if (root && root.children.length > 0) {
                    observer.disconnect();
                    resolve();
                }
            }).observe(document.body, { childList: true, subtree: true });
        });
    };

    // Process and serialize request body
    const processRequestBody = (body) => {
        if (!body) return undefined;

        try {
            if (typeof body === "string") {
                return body;
            } else if (body instanceof FormData) {
                return "FormData: " + Array.from(body.entries()).map(([key, value]) => `${key}=${value}`).join("&");
            } else if (body instanceof URLSearchParams) {
                return body.toString();
            } else if (body instanceof Blob) {
                return "Blob data";
            } else {
                return JSON.stringify(body);
            }
        } catch (e) {
            return "Could not serialize request body";
        }
    };

    // Intercept network requests
    const interceptNetworkRequests = () => {
        const originalFetch = window.fetch;

        window.fetch = async function (...args) {
            const startTime = Date.now();

            // Properly handle Request objects and string URLs
            const request = args[0] instanceof Request ? args[0] : new Request(args[0], args[1]);
            const requestUrl = request.url;
            const requestPath = extractPathFromUrl(requestUrl);
            const requestBody = processRequestBody(args?.[1]?.body);

            try {
                const response = await originalFetch(...args);
                let responseText;

                try {
                    if (response?.clone) {
                        const clonedResponse = response.clone();
                        responseText = await clonedResponse.text();
                    }
                } catch (e) {
                    responseText = "Could not read response body";
                }

                const requestData = {
                    type: "NETWORK_REQUEST",
                    request: {
                        url: requestUrl,
                        method: request.method,
                        status: response.status,
                        statusText: response.statusText,
                        responseBody: responseText,
                        requestBody: requestBody,
                        timestamp: new Date().toISOString(),
                        duration: Date.now() - startTime,
                        origin: window.location.origin,
                        headers: Object.fromEntries(request.headers),
                        path: requestPath
                    }
                };

                sendMessageToParent(requestData);

                // For 404 errors, also log to console to ensure capture
                if (response.status === 404) {
                    console.error(`404 Not Found: ${requestUrl}`, requestPath);
                }

                return response;
            } catch (error) {
                const errorInfo = {
                    type: "NETWORK_REQUEST",
                    request: {
                        url: requestUrl,
                        method: request.method,
                        origin: window.location.origin,
                        timestamp: new Date().toISOString(),
                        duration: Date.now() - startTime,
                        headers: Object.fromEntries(request.headers),
                        requestBody: requestBody,
                        path: requestPath,
                        error: {
                            message: error?.message || "Unknown fetch error",
                            stack: error?.stack || "Not available"
                        }
                    }
                };

                sendMessageToParent(errorInfo);
                console.error(`Fetch error for ${requestUrl}:`, error, `Path: ${requestPath}`);

                throw error;
            }
        };

        // Intercept XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
            this._softgenMonitorData = {
                method,
                url,
                path: extractPathFromUrl(url),
                startTime: null
            };
            return originalXHROpen.apply(this, [method, url, ...rest]);
        };

        XMLHttpRequest.prototype.send = function (body) {
            if (this._softgenMonitorData) {
                this._softgenMonitorData.startTime = Date.now();
                this._softgenMonitorData.requestBody = processRequestBody(body);

                // Add load event listener
                this.addEventListener('load', function () {
                    const duration = Date.now() - this._softgenMonitorData.startTime;

                    const requestData = {
                        type: "NETWORK_REQUEST",
                        request: {
                            url: this._softgenMonitorData.url,
                            method: this._softgenMonitorData.method,
                            status: this.status,
                            statusText: this.statusText,
                            responseBody: this.responseText,
                            requestBody: this._softgenMonitorData.requestBody,
                            timestamp: new Date().toISOString(),
                            duration: duration,
                            origin: window.location.origin,
                            path: this._softgenMonitorData.path
                        }
                    };

                    sendMessageToParent(requestData);

                    // For 404 errors, also log to console to ensure capture
                    if (this.status === 404) {
                        console.error(`404 Not Found: ${this._softgenMonitorData.url}`, this._softgenMonitorData.path);
                    }
                });

                // Add error event listener
                this.addEventListener('error', function () {
                    const duration = Date.now() - this._softgenMonitorData.startTime;

                    const errorData = {
                        type: "NETWORK_REQUEST",
                        request: {
                            url: this._softgenMonitorData.url,
                            method: this._softgenMonitorData.method,
                            status: 0,
                            statusText: "Network Error",
                            requestBody: this._softgenMonitorData.requestBody,
                            timestamp: new Date().toISOString(),
                            duration: duration,
                            origin: window.location.origin,
                            error: { message: "Network request failed" },
                            path: this._softgenMonitorData.path
                        }
                    };

                    sendMessageToParent(errorData);
                    console.error(`XHR error for ${this._softgenMonitorData.url}`, this._softgenMonitorData.path);
                });
            }

            return originalXHRSend.apply(this, arguments);
        };
    };

    // Extract 404 path from error message
    const extract404PathFromMessage = (message) => {
        if (!message || typeof message !== 'string') return null;

        // Look for different patterns of 404 errors
        const patterns = [
            // Standard 404 pattern
            /GET\s+(https?:\/\/[^\s]+)\s+404\s+\(Not\s+Found\)/i,
            // Script loading errors
            /Failed\s+to\s+load\s+script:\s+([^\s]+)/i,
            // Resource loading errors
            /Failed\s+to\s+load\s+resource:\s+(https?:\/\/[^\s]+)/i,
            // Generic 404 patterns
            /404\s+Not\s+Found:\s+(https?:\/\/[^\s]+)/i,
            /404\s+Not\s+Found\s+for\s+(https?:\/\/[^\s]+)/i,
            // Framework specific patterns
            /chunk\s+([^\s]+)\s+failed/i,
            /asset\s+([^\s]+)\s+not\s+found/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                return extractPathFromUrl(match[1]);
            }
        }

        return null;
    };

    // Set up error handling
    const setupErrorHandling = (() => {
        let isSetup = false;

        return () => {
            if (isSetup) return;

            // Set up network request interception
            interceptNetworkRequests();

            // Error deduplication
            const recentErrors = new Set();
            const getErrorKey = (error) => {
                const { lineno, colno, filename, message } = error;
                return `${message}|${filename}|${lineno}|${colno}`;
            };

            const isDuplicateError = (error) => {
                const key = getErrorKey(error);
                if (recentErrors.has(key)) return true;

                recentErrors.add(key);
                setTimeout(() => recentErrors.delete(key), 5000);
                return false;
            };

            // Format error for sending
            const formatError = ({ message, lineno, colno, filename, error }) => ({
                message,
                lineno,
                colno,
                filename,
                stack: error?.stack
            });

            // Handle runtime errors
            const handleError = (event) => {
                const key = getErrorKey(event);
                if (isDuplicateError(key)) return;

                const formattedError = formatError(event);

                // Try to extract path from error message or filename
                let path = extract404PathFromMessage(event.message);

                // If we didn't find a path from the message pattern, try from the filename
                if (!path && event.filename) {
                    path = extractPathFromUrl(event.filename);
                }

                sendMessageToParent({
                    type: "RUNTIME_ERROR",
                    error: {
                        ...formattedError,
                        path: path
                    }
                });

                // If this looks like a 404, also log it explicitly
                if (event.message && event.message.includes('404')) {
                    console.error(`Possible 404 error: ${event.message}`, `Path: ${path}`);
                }
            };

            // Add event listeners
            window.addEventListener("error", handleError, true); // Use capture phase

            // Special handling for script and stylesheet errors
            document.addEventListener('error', function (e) {
                const target = e.target;
                if (target.tagName === 'SCRIPT' || target.tagName === 'LINK') {
                    const url = target.src || target.href;
                    if (url) {
                        const path = extractPathFromUrl(url);
                        console.error(`Failed to load ${target.tagName.toLowerCase()}: ${url}`, `Path: ${path}`);

                        sendMessageToParent({
                            type: "RESOURCE_ERROR",
                            error: {
                                message: `Failed to load ${target.tagName.toLowerCase()}: ${url}`,
                                url: url,
                                path: path,
                                timestamp: new Date().toISOString()
                            }
                        });
                    }
                }
            }, true);

            // Handle unhandled promise rejections
            window.addEventListener("unhandledrejection", (event) => {
                if (!event.reason) return;

                const errorKey = event.reason?.stack || event.reason?.message || String(event.reason);
                if (isDuplicateError(errorKey)) return;

                const errorMessage = event.reason?.message || "Unhandled promise rejection";
                const path = extract404PathFromMessage(errorMessage);

                const error = {
                    message: errorMessage,
                    stack: event.reason?.stack || String(event.reason),
                    path: path
                };

                sendMessageToParent({
                    type: "UNHANDLED_PROMISE_REJECTION",
                    error
                });

                // If this looks like a 404, also log it explicitly
                if (errorMessage.includes('404')) {
                    console.error(`Possible 404 in promise rejection: ${errorMessage}`, `Path: ${path}`);
                }
            });

            // Capture resource loading errors (404s, etc.)
            const captureResourceErrors = () => {
                // Create a new observer instance
                if (typeof PerformanceObserver !== 'undefined') {
                    const observer = new PerformanceObserver((list) => {
                        list.getEntries().forEach((entry) => {
                            // Check for resource loading failures
                            if (entry.entryType === 'resource' && !entry.transferSize) {
                                const url = entry.name;

                                // Skip some common noise
                                if (url.includes('favicon.ico') ||
                                    url.includes('webpack-hmr') ||
                                    url.includes('hot-update.json')) {
                                    return;
                                }

                                try {
                                    const path = extractPathFromUrl(url);

                                    const resourceError = {
                                        type: "NETWORK_REQUEST",
                                        request: {
                                            url: url,
                                            method: "GET",
                                            status: 404, // Assume 404 for failed resources
                                            statusText: "Not Found",
                                            timestamp: new Date().toISOString(),
                                            path: path,
                                            origin: window.location.origin,
                                            error: { message: `Failed to load resource: ${path || url}` }
                                        }
                                    };

                                    sendMessageToParent(resourceError);

                                    // Also log to console to ensure it's captured by console interception
                                    console.error(`404 Not Found: ${url}`, `Path: ${path}`);
                                } catch (e) {
                                    console.warn("Failed to process resource error:", e);
                                }
                            }
                        });
                    });
                    // Start observing resource timing entries
                    observer.observe({ entryTypes: ['resource'] });
                }
            };

            // Call the function to capture resource errors
            captureResourceErrors();

            // Add a MutationObserver to capture dynamic script/resource loading failures
            const resourceLoadObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        for (const node of mutation.addedNodes) {
                            if (node.tagName === 'SCRIPT' || node.tagName === 'LINK' || node.tagName === 'IMG') {
                                node.addEventListener('error', (event) => {
                                    const src = node.src || node.href;
                                    if (src) {
                                        const path = extractPathFromUrl(src);
                                        console.error(`Failed to load ${node.tagName.toLowerCase()}: ${src}`, `Path: ${path}`);

                                        sendMessageToParent({
                                            type: "RESOURCE_ERROR",
                                            error: {
                                                message: `Failed to load ${node.tagName.toLowerCase()}: ${src}`,
                                                url: src,
                                                path: path,
                                                timestamp: new Date().toISOString()
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                }
            });

            resourceLoadObserver.observe(document, { childList: true, subtree: true });

            isSetup = true;
        };
    })();

    // Intercept console methods
    const setupConsoleInterception = (() => {
        let isSetup = false;
        let logSequence = 0;

        return () => {
            if (isSetup) return;

            const originalMethods = {
                log: console.log,
                info: console.info,
                debug: console.debug,
                warn: console.warn,
                error: console.error,
                trace: console.trace
            };

            const levelMap = {
                log: "info",
                info: "info",
                debug: "debug",
                warn: "warning",
                error: "error",
                trace: "trace"
            };

            // Helper to safely stringify objects
            const safeStringify = (obj) => {
                try {
                    // Special handling for Error objects - return them as-is
                    if (obj instanceof Error) {
                        return obj;
                    }

                    if (typeof obj === 'string') {
                        return obj;
                    }

                    // Handle circular references
                    const seen = new WeakSet();
                    return JSON.stringify(obj, (key, value) => {
                        if (typeof value === 'object' && value !== null) {
                            if (seen.has(value)) {
                                return '[Circular Reference]';
                            }
                            seen.add(value);
                        }
                        // Handle special types
                        if (value instanceof RegExp) return value.toString();
                        if (value instanceof Function) return value.toString();
                        if (value instanceof Date) return value.toISOString();
                        if (value === undefined) return 'undefined';
                        if (Number.isNaN(value)) return 'NaN';
                        if (value instanceof Error) return value;
                        return value;
                    }, 2);
                } catch (err) {
                    return `[Unable to stringify: ${err.message}]`;
                }
            };

            const interceptConsoleMethod = (method) => {
                console[method] = function (...args) {
                    // Call original method
                    originalMethods[method].apply(console, args);

                    // Get stack trace for all levels except log and info
                    let stack = null;
                    if (method !== "log" && method !== "info") {
                        const error = new Error();
                        if (error.stack) {
                            stack = error.stack.split('\n').slice(2).join('\n');
                        }
                    }

                    // Format message with better error handling
                    const formattedArgs = args.map(arg => {
                        if (arg === null) return 'null';
                        if (arg === undefined) return 'undefined';
                        if (arg instanceof Error) return arg;
                        if (typeof arg === 'object') return safeStringify(arg);
                        return String(arg);
                    });

                    // Special handling for Error objects to preserve their format
                    let message;
                    let messageStr;
                    if (formattedArgs.length === 1 && formattedArgs[0] instanceof Error) {
                        message = formattedArgs[0];
                        messageStr = message.stack || message.message || String(message);
                    } else {
                        messageStr = formattedArgs.map(arg =>
                            arg instanceof Error ?
                                (arg.stack || arg.message || String(arg)) :
                                String(arg)
                        ).join(" ");
                        message = messageStr;
                    }

                    // Add stack trace if available and not already included
                    if (stack && !messageStr.includes(stack)) {
                        message = messageStr + '\n' + stack;
                    }

                    // Extract path from error messages
                    let path = null;
                    if (method === "error" || method === "warn") {
                        // Check all arguments for potential paths
                        for (const arg of args) {
                            if (arg instanceof Error) {
                                path = extract404PathFromMessage(arg.message);
                                if (path) break;
                            } else if (typeof arg === 'string') {
                                path = extract404PathFromMessage(arg) || extractPathFromUrl(arg);
                                if (path) break;
                            }
                        }
                    }

                    // Send to parent with sequence number
                    sendMessageToParent({
                        type: "CONSOLE_OUTPUT",
                        level: levelMap[method],
                        message: message,
                        logged_at: new Date().toISOString(),
                        sequence: logSequence++,
                        path: path,
                        metadata: {
                            hasStack: !!stack,
                            argTypes: args.map(arg => typeof arg),
                            isError: args.some(arg => arg instanceof Error)
                        }
                    });
                };
            };

            // Intercept all console methods
            Object.keys(originalMethods).forEach(interceptConsoleMethod);

            // Also intercept console.assert
            const originalAssert = console.assert;
            console.assert = function (condition, ...args) {
                originalAssert.apply(console, [condition, ...args]);
                if (!condition) {
                    const message = args.length ? args.join(' ') : 'Assertion failed';
                    sendMessageToParent({
                        type: "CONSOLE_OUTPUT",
                        level: "error",
                        message: `Assertion failed: ${message}`,
                        logged_at: new Date().toISOString(),
                        sequence: logSequence++,
                        metadata: {
                            type: 'assertion',
                            condition: String(condition)
                        }
                    });
                }
            };

            isSetup = true;
        };
    })();

    // Main initialization
    const initialize = () => {
        console.log('Softgen Script.js Monitoring started');

        if (window.location.search.includes("softgen-override-script")) {
            console.log("Overriding script with development version");
            return;
        }

        // Only run in iframes
        if (window.top !== window.self) {
            setupUrlChangeDetection();
            setupErrorHandling();
            setupConsoleInterception();

            // Send ready message
            waitForDomReady().then(() => {
                sendMessageToParent({
                    type: "MONITOR_SCRIPT_LOADED",
                    timestamp: new Date().toISOString(),
                    path: document.location.pathname
                });

                console.log("SoftGen monitoring script loaded");
            });
        }
    };
    // Start the script
    initialize();
})();