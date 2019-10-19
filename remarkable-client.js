var remarkableClient = function (token) {
    console.log("Loading remark. client");
    var self = this;
    self.register_uri = 'https://my.remarkable.com/token/json/2/device/new';
    self.refresh_uri = 'https://my.remarkable.com/token/json/2/user/new';
    self.create_doc_uri = "/document-storage/json/2/upload/request"
    self.update_metadata_uri = "/document-storage/json/2/upload/update-status"
    self.service = "https://document-storage-production-dot-remarkable-production.appspot.com"

    self.token = token
    
    self.ajax = function(uri, method, data) {
        var request = {
            url: uri,
            type: method,
            contentType: "application/json",
            accepts: "application/json",
            cache: false,
            dataType: 'json',
            data: JSON.stringify(data),
            beforeSend: function (xhr) {
                console.log(self.token)
                if (self.token) {
                    console.log("Setting token");
                    xhr.setRequestHeader("Authorization", 
                        "Bearer " + self.token);
                };
            },
            error: function(jqXHR) {
                console.log("Oh no, an error! :( - " + jqXHR.status);
                console.log(jqXHR.responseText);
                console.log(jqXHR)
            }
        };
        return $.ajax(request);
    }

    self.uuid_gen = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    self.set_token = function(data) {
        self.token = data
        return token
    }

    self.register = function(code, device_description) {
        console.log("Registering...")
        request_payload = {
            "code": code,
            "deviceDesc": "desktop-windows",
            "deviceID": uuid_gen()
        }
        console.log(request_payload)
        return self.ajax(self.register_uri, 'POST', request_payload);
    }

    self.authorize = function () {
        console.log("Refreshing token...")
        if (self.token){
            return self.ajax(
                self.refresh_uri, 'POST', request_payload
                );
            }
        else {
            console.log("Cannot refresh non existent token")
        }
    }

    self.create_doc = function(blob){
        console.log("Creating doc")
        doc_id = uuid_gen();

        request_payload = [{
            "ID": doc_id,
            "Type": "DocumentType",
            "Version": 1,
        }]
        
        uri = self.service + self.create_doc_uri
        console.log(uri)
        create_request = self.ajax(uri, 'PUT', request_payload);

        console.log("Prep Upload")
        create_request.then((result) => {self.upload_doc(result, blob, doc_id)})
    }
    
    self.service_discover = function() {
        $.ajax({
            type: 'GET',
            url: "https://service-manager-production-dot-remarkable-production.appspot.com/service/json/1/document-storage?environment=production&group=auth0%7C5a68dc51cb30df3877a1d7c4&apiVer=2"
        }).done(function(data) {
            if (data.Status == "Ok") {
                console.log("Service OK");
                self.service = "https://" + data.Host
            }
            else {
                console.log("Service discovery failed")
            }
        });
    }

    self.upload_doc = function(doc_object, pdf_blob, name) {
        console.log("Uploading... to ");
        console.log(doc_object);

        doc_object.BlobURLPut
        var fd = new FormData();
        fd.append('fname', name);
        fd.append('data', pdf_blob);
        $.ajax({
            type: 'PUT',
            url: doc_object.BlobURLPut,
            data: fd,
            processData: false,
            contentType: false
        }).done(function(data) {
            self.update_metadata(doc_object)
            console.log("Upload done")
        });
    }

    self.update_metadata = function(doc_object) {
        console.log("Updating metadata");
        request_payload = [{
            "ID": doc_object[0].ID,
            "Version": 2,
            "VissibleName": doc_object[0].ID,
            "CurrentPage": 0,
            "Bookmarked": false,
        }]
        uri = self.service + self.update_metadata_uri
        self.ajax(uri, 'PUT', request_payload).done(function(data) {
            console.log("Updated metadata done")
        });
    }
    return self
};

