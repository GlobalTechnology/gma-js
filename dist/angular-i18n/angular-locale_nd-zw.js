"use strict";angular.module("ngLocale",[],["$provide",function(a){function M(a){a+="";var M=a.indexOf(".");return-1==M?0:a.length-M-1}function i(a,i){var e=i;void 0===e&&(e=Math.min(M(a),3));var n=Math.pow(10,e),t=(a*n|0)%n;return{v:e,f:t}}var e={ZERO:"zero",ONE:"one",TWO:"two",FEW:"few",MANY:"many",OTHER:"other"};a.value("$locale",{DATETIME_FORMATS:{AMPMS:["AM","PM"],DAY:["Sonto","Mvulo","Sibili","Sithathu","Sine","Sihlanu","Mgqibelo"],MONTH:["Zibandlela","Nhlolanja","Mbimbitho","Mabasa","Nkwenkwezi","Nhlangula","Ntulikazi","Ncwabakazi","Mpandula","Mfumfu","Lwezi","Mpalakazi"],SHORTDAY:["Son","Mvu","Sib","Sit","Sin","Sih","Mgq"],SHORTMONTH:["Zib","Nhlo","Mbi","Mab","Nkw","Nhla","Ntu","Ncw","Mpan","Mfu","Lwe","Mpal"],fullDate:"EEEE, d MMMM y",longDate:"d MMMM y",medium:"d MMM y h:mm:ss a",mediumDate:"d MMM y",mediumTime:"h:mm:ss a","short":"dd/MM/y h:mm a",shortDate:"dd/MM/y",shortTime:"h:mm a"},NUMBER_FORMATS:{CURRENCY_SYM:"$",DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{gSize:3,lgSize:3,maxFrac:3,minFrac:0,minInt:1,negPre:"-",negSuf:"",posPre:"",posSuf:""},{gSize:3,lgSize:3,maxFrac:2,minFrac:2,minInt:1,negPre:"¤-",negSuf:"",posPre:"¤",posSuf:""}]},id:"nd-zw",pluralCat:function(a,M){var n=0|a,t=i(a,M);return 1==n&&0==t.v?e.ONE:e.OTHER}})}]);