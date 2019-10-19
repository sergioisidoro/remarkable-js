# WORK IN PROGRESS

#### Btw: If you want to help me build  a browser extension to send simplified PDF versions of webpages, please get in touch.

```
// Not auth
client = remarkableClient(null)

var otp = "xxxxxxx"
vat device_name = "desktop-windows"

// Register device
register_promise = client.register(otp, device_name)

register_promise.done((res) => {
  client.set_token(res)
});

// CREATE ZIP FILE WITH PDF HERE, AND CREATE DOC

client.create_doc(content)

// Starting client with pre-registered token:
client = remarkableClient(remarkable_token) 
```
