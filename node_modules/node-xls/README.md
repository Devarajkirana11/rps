# node-xls

## install
npm install node-xls

## startup
a simple example: example/example.js


    var fs = require ('fs');
    var NodeXls = require('node-xls');
    var data = [{
        foo: "aaa",
        stux: new Date(),
        boom: "boom"
    },{
        foo: "bbb",
        stux: new Date(),
        boom: "boom again"
    }]
    var tool = new NodeXls();
    // columns will be ordered by ["stux", "foo", "boom"]; column "boom" will be named "hello"
    var xls = tool.json2xls(data, {order:["stux", "foo", "boom"], fieldMap: {boom: "hello"}}); 
    fs.writeFileSync('output.xlsx',xls, 'binary');


## usage
### NodeXls.json2xls(data, option)
Create a xls file with an array of json object.
- data: a json object or an array of json object
- option:   
order: column order. fields of object will be written into excel by this order.  
fieldMap: map name of fields(columns)


