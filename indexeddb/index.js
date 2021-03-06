// https://developer.mozilla.org/en/IndexedDB/Using_IndexedDB

var db;
var arrayKey = [];
var openRequest;
var lastCursor;
var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

function init() {
    openRequest = indexedDB.open("persons");
    //handle setup
    openRequest.onupgradeneeded = function (e) {
        console.log("running onupgradeneeded");
        var thisDb = e.target.result;
        if (!thisDb.objectStoreNames.contains("person")) {
            console.log("I need to create the objectstore");
            var objectStore = thisDb.createObjectStore("person", {keyPath: "id", autoIncrement: true});
            objectStore.createIndex("name", "name", {unique: false});
        }
    };

    openRequest.onsuccess = function (e) {
        db = e.target.result;
        db.onerror = function (event) {
            // Generic error handler for all errors targeted at this database's
            alert("Database error: " + event.target.errorCode);
            console.log(event.target);
        };
        if (db.objectStoreNames.contains("person")) {
            console.log("contains person");
            var transaction = db.transaction(["person"], "readwrite");
            transaction.oncomplete = function (event) {
                console.log("All done!");
            };
            var content = document.querySelector("#content");
            transaction.onerror = function (event) {
                // Don't forget to handle errors!
                console.log(event);
            };

            var objectStore = transaction.objectStore("person"); //得到person的objectStore对象

            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                var flag = 0;
                if (cursor) {
                    console.log(cursor.key);
                    // console.log(cursor.value);
                    var div = document.createElement("div");
                    div.id = cursor.key;
                    var div1 = document.createElement("div");
                    var div2 = document.createElement("div");
                    var div3 = document.createElement("div");
                    div1.innerHTML = cursor.value[flag]["name"];
                    div2.innerHTML = cursor.value[flag]["phone"];
                    div3.innerHTML = cursor.value[flag]["address"];
                    div.appendChild(div1);
                    div.appendChild(div2);
                    div.appendChild(div3);
                    content.appendChild(div);
                    arrayKey.push(cursor.key);
                    flag++;
                    lastCursor = cursor.key;
                    cursor.continue();
                }
                else {
                    console.log("Done with cursor");
                }
            };
            objectStore.openCursor().onerror = function (event) {
                console.log(event);
            };
        }
    };

    openRequest.onerror = function (event) {
        // 对request.error做一些需要的处理！
        console.log("your web may not support IndexedDB,please check.");
    };

    //add new record
    document.querySelector("#add").addEventListener("click", function () {
        var name = document.querySelector("#name").value;
        var phone = document.querySelector("#phone").value;
        var address = document.querySelector("#address").value;
        var person = [{"name": name, "phone": phone, "address": address}]

        var transaction = db.transaction(["person"], "readwrite");
        transaction.oncomplete = function (event) {
            // console.log("transaction complete");
        };
        transaction.onerror = function (event) {
            console.log(event);
        };
        var objectStore = transaction.objectStore("person"); //得到person的objectStore对象
        objectStore.add(person);
        objectStore.openCursor().onsuccess = function (event) {
            cursor = event.target.result;
            var key;
            if (lastCursor == null) {
                key = cursor.key;
                lastCursor = key;
            }
            else {
                key = ++lastCursor;
            }
            var content = document.querySelector("#content");
            var div = document.createElement("div");
            div.id = key;
            var div1 = document.createElement("div");
            var div2 = document.createElement("div");
            var div3 = document.createElement("div");
            div1.innerHTML = name;
            div2.innerHTML = phone;
            div3.innerHTML = address;
            div.appendChild(div1);
            div.appendChild(div2);
            div.appendChild(div3);
            content.appendChild(div);
            arrayKey.push(key);
            console.log("success add new record!key:" + key);
            console.log(person);
        }
    });
    document.querySelector("#delete").addEventListener("click", function () {
        if (arrayKey.length == 0) {
            console.log("no data to delete!");
        }
        else {
            var transaction = db.transaction(["person"], "readwrite");
            transaction.oncomplete = function (event) {
                //		console.log("transaction complete!");
            };

            transaction.onerror = function (event) {
                console.log(event);
            };
            var objectStore = transaction.objectStore("person"); //得到person的objectStore对象
            var removeKey = arrayKey.shift();
            var getRequest = objectStore.get(removeKey);
            getRequest.onsuccess = function (e) {
                var result = getRequest.result;
                console.log(result);
            };
            var request = objectStore.delete(removeKey);
            request.onsuccess = function (e) {
                console.log("success delete record!");
            };
            request.onerror = function (e) {
                console.log("Error delete record:", e);
            };
            //隐藏要删除的元素
            document.getElementById(removeKey).style.display = "none";
        }
    });

//        该功能存在问题，暂时无法解决
//        document.querySelector("#deleteDB").addEventListener("click", function()
//        {
//            var deleteDB=indexedDB.deleteDatabase("persons");
//            var content= document.querySelector("#content");
//            while(content.firstChild)
//            {
//                content.removeChild(content.firstChild);
//            }

//            deleteDB.onsuccess=function(event){
//                console.log("success delete database!");
//            };
//
//            deleteDB.onerror=function(event){
//                console.log(event.target)
//            };
//		});
}
window.addEventListener("DOMContentLoaded", init, false);