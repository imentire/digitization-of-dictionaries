/**
 * @class Stemmer
 * @module Parsers
 */
'use strict';
module.exports = (function() {

    var vowel = 'аеёиоуыэюя';
    var word = '';
    var regexPerfectiveGerunds = [
        '(в|вши|вшись)$',
        '(ив|ивши|ившись|ыв|ывши|ывшись)$'
    ];
    var regexAdjective = '(ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$';
    var regexParticiple = [
        '(ем|нн|вш|ющ|щ)',
        '(ивш|ывш|ующ)'
    ];
    var regexReflexives = '(ся|сь)$';
    var regexVerb = [
        '(ла|на|ете|йте|ли|й|л|ем|н|ло|но|ет|ют|ны|ть|ешь|нно)$',
        '(ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|уют|ит|ыт|ены|ить|ыть|ишь|ую|ю)$'
    ];
    var regexNoun = '(а|ев|ов|ие|ье|е|иями|ями|ами|еи|ии|и|ией|ей|ой|ий|й|иям|ям|ием|ем|ам|ом|о|у|ах|иях|ях|ы|ь|ию|ью|ю|ия|ья|я)$';
    var regexSuperlative = '(ейш|ейше)$';
    var regexDerivational = '(ост|ость)$';
    var regexI = 'и$';
    var regexNN = 'нн$';
    var regexSoftSign = 'ь$';
    var RV = 0;
    var R2 = 0;

    function Stemmer() {}

    Stemmer.prototype = Object.create(Object.prototype);
    Stemmer.prototype.constructor = Stemmer;

    Stemmer.prototype.getWordBase = function (_word) {
        word = _word;
        findRegions();

        //Шаг 1
        //Найти окончание PERFECTIVE GERUND. Если оно существует – удалить его и завершить этот шаг.
        if (!removeEndings(regexPerfectiveGerunds, RV)) {
            //Иначе, удаляем окончание REFLEXIVE (если оно существует).
            removeEndings(regexReflexives, RV);
            //Затем в следующем порядке пробуем удалить окончания: ADJECTIVAL, VERB, NOUN. Как только одно из них найдено – шаг завершается.
            if (!(removeEndings(
                    [
                        regexParticiple[0] + regexAdjective,
                        regexParticiple[1] + regexAdjective
                    ],
                    RV
                ) || removeEndings(regexAdjective, RV))
            ) {
                if (!removeEndings(regexVerb, RV)) {
                    removeEndings(regexNoun, RV);
                }
            }
        }
        //Шаг 2
        //Если слово оканчивается на и – удаляем и.
        removeEndings(regexI, RV);
        //Шаг 3
        //Если в R2 найдется окончание DERIVATIONAL – удаляем его.
        removeEndings(regexDerivational, R2);
        //Шаг 4
        //Возможен один из трех вариантов:
        //Если слово оканчивается на нн – удаляем последнюю букву.
        if (removeEndings(regexNN, RV)) {
            word += 'н';
        }
        //Если слово оканчивается на SUPERLATIVE – удаляем его и снова удаляем последнюю букву, если слово оканчивается на нн.
        removeEndings(regexSuperlative, RV);

        if (removeEndings(regexNN, RV)) {
            word += 'н';
        }
        //Если слово оканчивается на ь – удаляем его.
        removeEndings(regexSoftSign, RV);
        return word;
    }

    function removeEndings(regex, region) {
        let prefix = word.substr(0, region);
        let otherWord = word.substr(prefix.length);
        if (Array.isArray(regex)) {

            if (otherWord.match(new RegExp('.*[а|я]' + regex[0], 'g'))) {
                word = prefix + otherWord.replace(new RegExp(regex[0], 'g'), '');
                return true;
            }
            regex = regex[1];
        }
        if (otherWord.match(new RegExp('.*' + regex, 'g'))) {
            word = prefix + otherWord.replace(new RegExp(regex), '');

            return true;
        }
        return false;
    }

    function findRegions() {
        var state = 0;
        for (var i = 1; i <= word.length; i++) {
            var prevChar = word.substr(i - 1, 1);
            var char = word.substr(i, 1);
            switch (state) {
                case 0:
                    if (isVowel(prevChar)) {
                        RV = i;
                        state = 1;
                    }
                case 1:
                    if (isVowel(prevChar) && !isVowel(char)) {
                        state = 2;
                    }
                    break;
                case 2:
                    if (isVowel(prevChar) && !isVowel(char)) {
                        R2 = i;
                        return;
                    }
                    break;
            }
        }
    }

    function isVowel(char) {
        return vowel.indexOf(char) !== -1;
    }

    return Stemmer;
}())
