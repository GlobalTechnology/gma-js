"use strict";angular.module("ngLocale",[],["$provide",function(e){var M={ZERO:"zero",ONE:"one",TWO:"two",FEW:"few",MANY:"many",OTHER:"other"};e.value("$locale",{DATETIME_FORMATS:{AMPMS:["AM","PM"],DAY:["اتوار","پیر","منگل","بُدھ","جمعرات","جمعہ","ہفتہ"],MONTH:["جنوری","فروری","مارچ","اپریل","مئ","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"],SHORTDAY:["ਐਤ.","ਸੋਮ.","ਮੰਗਲ.","ਬੁਧ.","ਵੀਰ.","ਸ਼ੁੱਕਰ.","ਸ਼ਨੀ."],SHORTMONTH:["ਜਨਵਰੀ","ਫ਼ਰਵਰੀ","ਮਾਰਚ","ਅਪ੍ਰੈਲ","ਮਈ","ਜੂਨ","ਜੁਲਾਈ","ਅਗਸਤ","ਸਤੰਬਰ","ਅਕਤੂਬਰ","ਨਵੰਬਰ","ਦਸੰਬਰ"],fullDate:"EEEE, dd MMMM y",longDate:"d MMMM y",medium:"d MMM y h:mm:ss a",mediumDate:"d MMM y",mediumTime:"h:mm:ss a","short":"dd/MM/y h:mm a",shortDate:"dd/MM/y",shortTime:"h:mm a"},NUMBER_FORMATS:{CURRENCY_SYM:"Rs",DECIMAL_SEP:"٫",GROUP_SEP:",",PATTERNS:[{gSize:2,lgSize:3,maxFrac:3,minFrac:0,minInt:1,negPre:"-",negSuf:"",posPre:"",posSuf:""},{gSize:2,lgSize:3,maxFrac:2,minFrac:2,minInt:1,negPre:"¤-",negSuf:"",posPre:"¤",posSuf:""}]},id:"pa-arab-pk",pluralCat:function(e,a){return e>=0&&1>=e?M.ONE:M.OTHER}})}]);