import Core from '../core';
import exphbs = require('express-handlebars');
import Time from '../helpers/time';


const Entities = require('html-entities').AllHtmlEntities;
var path = require('path');
var in_array = require('in_array');
var converter = require('to-words');
import * as moment from 'moment-timezone';

export default class HandlebarsExtnManager {

    public static handle(): exphbs.create {
        var hbs = exphbs.create({
            defaultLayout: 'main',
            helpers: {
                equal: function(lvalue, rvalue, options) {
                    if(lvalue !== undefined && rvalue !==  undefined){
                        if(lvalue!==null && rvalue !== null ) {
                            return (lvalue.toString() == rvalue.toString()) ? options.fn(this) : options.inverse(this);
                        }else {
                            return options.inverse(this);
                        }
                    }else{
                        return options.inverse(this);
                    }
                    
                },
                notequal: function(lvalue, rvalue, options) {
                    if(lvalue !== undefined && rvalue !==  undefined){
                        if(lvalue!==null && rvalue !== null ) {
                            return (lvalue.toString() != rvalue.toString()) ? options.fn(this) : options.inverse(this);
                        } else {
                            return options.inverse(this);
                        }
                    }else{
                        return options.inverse(this);
                    }
                    
                },
                isArray: function(arrayobj,options) {
                    return (Array.isArray(arrayobj)) ? options.fn(this) : options.inverse(this);
                },
                inArray: function(array, value, options) {
                    if(in_array(value, array)){
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
                    }
                },
                notInArray: function(array, value, options) {
                    if(in_array(value, array)){
                        return options.inverse(this);
                    } else {
                        return options.fn(this);
                    }
                },
                trim: function(value) {
                    return value.trim();
                },
                count: function(value) {
                    return value.length;
                },
                getRoomTypeName: function(value) {
                   	let type_array = ["","Single room", "Double Room", "Twin", "Twin/Double" , "Triple Room" , "Quadruple" , "Family" , "Suite" , "Studio" , "Apartment" , "Dorm Room" , "Bed in Dorm Room" , "Bungalow" , "Chalet" , "Villa" , "Vacation Home" , "Mobile Home" , "Tent" , "Super Single" , "Standard Twin" ,"Vacation Home","Signature Queen", "Signature King" , "Deluxe Family","Standard Quadruple","Standard Triple","Standard","Standard Double","Standard King","Deluxe","Deluxe Double","Super Deluxe","Double","Double Twin","Junior Double","Superior Double","Superior Twin","Superior Bungalow","Deluxe Triple Bungalow","Deluxe Quadruple Bungalow","Deluxe family Bungalow","Standard Family Room for 6","Standard Family Room for 8","Quadruple Pool View","Triple Pool View"];
                    return type_array[value];
                },
                customDateFormat: function(value) {
                    if (value) {
                        return Time.formatGivenDate(value);
                    } else {
                        return value;
                    }
                },
                customDateFormatwithTime: function(value) {
                    if (value) {
                        return Time.formatGivenDateWithTime(value);
                    } else {
                        return value;
                    }
                },
                countrycustomDateFormatwithTime: function(value,country) {
                    if (value) {
                        if(country == 'Malaysia'){
                            return Time.formatGivenDateWithTime(value);
                        } else {
                            return Time.countryFormatGivenDateWithTime(value,country);
                        }
                    } else {
                        return value;
                    }
                },
                increment: function(value,increment) {
                    return parseInt(value)+increment;
                },
                checkCount: function(value, operator, index,options) {
                    if(operator === '>' && value > index)
                        return options.fn(this);
                    else if(operator === '<' && value < index) 
                        return options.fn(this);
                    else
                        return  options.inverse(this);
                },
                contact:function(prefix, id) {
                    return (prefix + id);
                },
                JSONstringify: function(value) {
                    return JSON.stringify(value);
                },
                JSONparse: function(value) {
                    return JSON.parse(value)
                },
                round: function(value) {
                    if(value > 0){
                        let output = parseFloat(value).toFixed(2);
                        return output;
                    } else {
                        let output = value;
                        return output;         
                    }
                 },
                 division: function(num, den, dec) {
                     if( den == 0 ) {
                         return 0;
                     } else {
                        return parseFloat((num / den).toString()).toFixed(dec);
                     }
                 },
                 roundNumbers: function(value, decimal) {
                    if(value > 0){
                        let output = parseFloat(value).toFixed(decimal);
                        return output;
                    } else {
                        let output = value;
                        return output;         
                    }
                 },
                in: function(needle, haystack, options){
                    if(haystack!==undefined ){
                        if(haystack !== null) {
                            let condition:any;
                            if(haystack.constructor === Array) {
                                condition = in_array(needle, haystack);
                            } else {
                                needle = needle.toString();
                                haystack = haystack.toString();
                                condition = (haystack.indexOf(needle)>-1?true:false);
                            }
                            //needle = needle.toString();
                            //haystack = haystack.toString();
                            //if(haystack.indexOf(needle)>-1){
                            if(condition) {
                               return options.fn(this)                   
                            } else{
                               return options.inverse(this);
                            }
                        }
                     }else{
                        options.inverse(this);
                     }  
                },
                concat: function() {
                    var outStr = '';
                    for(var arg in arguments){
                        if(typeof arguments[arg]!='object'){
                            outStr += arguments[arg];
                        }
                    }
                    return outStr;
                },
                getChildProperty: function(haystack, needle, htmlencode = false) {
                    const entities = new Entities();
                    if(haystack!== undefined ) {
                        if(haystack[needle]!== undefined){
                            if(htmlencode == true) {
                                let property = haystack[needle];
                                if(haystack[needle].length > 0) {
                                   property = JSON.stringify(haystack[needle]);
                                }                                
                                return  entities.encode(property);
                            }else{
                                return haystack[needle]
                            }
                            
                        }else{
                            return "";
                        }

                    }else{
                        return "";
                    }
                },
                setVar:function(varName,varValue,context){
                    this[varName] = varValue;
                },
                checkArrErrValidation: function(arr,value,index,type,options) {
                    if(type=='numeric') {
                        if(value=="" || value=== null || value ===  undefined) {
                            return options.fn(this);
                        } else {
                            if(isNaN(value)) {
                                return options.fn(this);
                            } else {
                                return options.inverse(this);
                            }
                        }
                    }else if(type=="duplicate") {
                        if(arr.constructor === Array) {
                            let temp = new Array();
                            let errorIndex:number;
                            arr.forEach((item,index)=>{
                                console.log(item);
                                if(in_array(item,temp,true)){
                                    errorIndex = index;
                                } else{
                                    temp.push(item);
                                }
                            });
                            if(index == errorIndex){
                                return options.fn(this)
                            }else{
                                return options.inverse(this);
                            }
                        } else {
                            return options.fn(this);
                        }
                    }
                },
                times: function(n, block) {
                    var accum = '';
                    for(var i = 0; i < n; ++i)
                        accum += block.fn(i);
                    return accum;
                },
                addTwoNumber: function(first,second) {
                    return Number(first)+Number(second);
                },
                numberToWords: function(number) {
                    console.log(typeof Number(number));
                    console.log(number);
                    return converter(Number(number));
                }



            },
            partialsDir:path.join(__dirname,'../views/partials/')

        })

        return hbs;
    }




}