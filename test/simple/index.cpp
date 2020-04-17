#include <napi.h>

using namespace Napi;

Value getHello(const CallbackInfo& info) {
    // We need to validate the arguments here
    return String::New(info.Env(), "Hello World");
}
Object init(Env env, Object exports) {
    exports["hello"] = Function::New(env, getHello);
    return exports;
}
NODE_API_MODULE(cvip, init)