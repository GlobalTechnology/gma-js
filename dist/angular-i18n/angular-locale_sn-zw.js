"use strict";angular.module("ngLocale",[],["$provide",function(u){function i(u){u+="";var i=u.indexOf(".");return-1==i?0:u.length-i-1}function a(u,a){var M=a;void 0===M&&(M=Math.min(i(u),3));var e=Math.pow(10,M),n=(u*e|0)%e;return{v:M,f:n}}var M={ZERO:"zero",ONE:"one",TWO:"two",FEW:"few",MANY:"many",OTHER:"other"};u.value("$locale",{DATETIME_FORMATS:{AMPMS:["AM","PM"],DAY:["Svondo","Muvhuro","Chipiri","Chitatu","China","Chishanu","Mugovera"],MONTH:["Ndira","Kukadzi","Kurume","Kubvumbi","Chivabvu","Chikumi","Chikunguru","Nyamavhuvhu","Gunyana","Gumiguru","Mbudzi","Zvita"],SHORTDAY:["Svo","Muv","Chip","Chit","Chin","Chis","Mug"],SHORTMONTH:["Ndi","Kuk","Kur","Kub","Chv","Chk","Chg","Nya","Gun","Gum","Mb","Zvi"],fullDate:"EEEE, d MMMM y",longDate:"d MMMM y",medium:"d MMM y h:mm:ss a",mediumDate:"d MMM y",mediumTime:"h:mm:ss a","short":"dd/MM/y h:mm a",shortDate:"dd/MM/y",shortTime:"h:mm a"},NUMBER_FORMATS:{CURRENCY_SYM:"$",DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{gSize:3,lgSize:3,maxFrac:3,minFrac:0,minInt:1,negPre:"-",negSuf:"",posPre:"",posSuf:""},{gSize:3,lgSize:3,maxFrac:2,minFrac:2,minInt:1,negPre:"¤-",negSuf:"",posPre:"¤",posSuf:""}]},id:"sn-zw",pluralCat:function(u,i){var e=0|u,n=a(u,i);return 1==e&&0==n.v?M.ONE:M.OTHER}})}]);