"use strict";angular.module("ngLocale",[],["$provide",function(e){var m={ZERO:"zero",ONE:"one",TWO:"two",FEW:"few",MANY:"many",OTHER:"other"};e.value("$locale",{DATETIME_FORMATS:{AMPMS:["a. m.","p. m."],DAY:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],MONTH:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],SHORTDAY:["dom.","lun.","mar.","mié.","jue.","vie.","sáb."],SHORTMONTH:["ene.","feb.","mar.","abr.","may.","jun.","jul.","ago.","sept.","oct.","nov.","dic."],fullDate:"EEEE, d 'de' MMMM 'de' y",longDate:"d 'de' MMMM 'de' y",medium:"d/M/y H:mm:ss",mediumDate:"d/M/y",mediumTime:"H:mm:ss","short":"d/M/yy H:mm",shortDate:"d/M/yy",shortTime:"H:mm"},NUMBER_FORMATS:{CURRENCY_SYM:"$",DECIMAL_SEP:",",GROUP_SEP:".",PATTERNS:[{gSize:3,lgSize:3,maxFrac:3,minFrac:0,minInt:1,negPre:"-",negSuf:"",posPre:"",posSuf:""},{gSize:3,lgSize:3,maxFrac:2,minFrac:2,minInt:1,negPre:"-",negSuf:" ¤",posPre:"",posSuf:" ¤"}]},id:"es-sv",pluralCat:function(e,o){return 1==e?m.ONE:m.OTHER}})}]);