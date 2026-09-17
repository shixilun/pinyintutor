/*
const stringify = require('safe-stable-stringify');
const rl = require('readline').createInterface({input: process.stdin});

rl.on('line', (l) => {
    l = l.trim();
    if (l) console.log(parse(l));
});
*/

const initials = {
    '': 1,
    'zh': 1,
    'ch': 1,
    'sh': 1,
};
"bpmfdtnlgkhjqxžčšrzcs".split('').forEach((i) => {initials[i] = 1});

const tones = {
    'a': "aāáǎà",
    'e': "eēéěè",
    'i': "iīíǐì",
    'o': "oōóǒò",
    'u': "uūúǔù",
    'ü': "üǖǘǚǜ",
};

function untone(syl) {
    return syl
        .replace(/[āáǎà]/, 'a')
        .replace(/[ēéěè]/, 'e')
        .replace(/[īíǐì]/, 'i')
        .replace(/[ōóǒò]/, 'o')
        .replace(/[ūúǔù]/, 'u')
        .replace(/[ǖǘǚǜ]/, 'ü');
}

function splittone(syl) {
    let match;
    switch (true) {
    case !!(match = /[āáǎà]/.exec(syl)):
        return [
            syl.substring(0, match.index) + 'a' + syl.substring(match.index + 1),
            tones['a'].indexOf(match[0]),
        ]
    case !!(match = /[ēéěè]/.exec(syl)):
        return [
            syl.substring(0, match.index) + 'e' + syl.substring(match.index + 1),
            tones['e'].indexOf(match[0]),
        ]
    case !!(match = /[īíǐì]/.exec(syl)):
        return [
            syl.substring(0, match.index) + 'i' + syl.substring(match.index + 1),
            tones['i'].indexOf(match[0]),
        ]
    case !!(match = /[ōóǒò]/.exec(syl)):
        return [
            syl.substring(0, match.index) + 'o' + syl.substring(match.index + 1),
            tones['o'].indexOf(match[0]),
        ]
    case !!(match = /[ūúǔù]/.exec(syl)):
        return [
            syl.substring(0, match.index) + 'u' + syl.substring(match.index + 1),
            tones['u'].indexOf(match[0]),
        ]
    case !!(match = /[ǖǘǚǜ]/.exec(syl)):
        return [
            syl.substring(0, match.index) + 'ü' + syl.substring(match.index + 1),
            tones['ü'].indexOf(match[0]),
        ]
    default:
        return [syl, 0];
    }
}

function addtone(syl, tone) {
    let oldsyl = syl;
    syl = untone(syl);
    if (!tone) return syl;
    let match;
    switch (true) {
    case !!(match = /iu(?:r?)$/.exec(syl)):
        return syl.substr(0, match.index + 1) + tones['u'].at(tone) + syl.substring(match.index + 2);
    case !!(match = /ui(?:r?)$/.exec(syl)):
        return syl.substr(0, match.index + 1) + tones['i'].at(tone) + syl.substring(match.index + 2);
    case !!(match = /(.)(?:ng?)(?:r?)$/.exec(syl)):
        return syl.substr(0, match.index) + tones[match[1]].at(tone) + syl.substring(match.index + 1);
    case !!(match = /ai(?:r?)$/.exec(syl)):
        return syl.substr(0, match.index) + tones['a'].at(tone) + syl.substring(match.index + 1);
    case !!(match = /ao(?:r?)$/.exec(syl)):
        return syl.substr(0, match.index) + tones['a'].at(tone) + syl.substring(match.index + 1);
    case !!(match = /ei(?:r?)$/.exec(syl)):
        return syl.substr(0, match.index) + tones['e'].at(tone) + syl.substring(match.index + 1);
    case !!(match = /ou(?:r?)$/.exec(syl)):
        return syl.substr(0, match.index) + tones['o'].at(tone) + syl.substring(match.index + 1);
    case !!(match = /([aeiouü])(?:r?)$/.exec(syl)):
        return syl.substr(0, match.index) + tones[match[1]].at(tone) + syl.substring(match.index + 1);
    default:
        return oldsyl;
    }
}

function parse(syl) {
    if (!syl) return "you haven't entered a syllable";
    let rawsyl = untone(syl);
    if (rawsyl === 'er') return "";
    let {initial, final} = /(?<initial>[^aeiouüwy]*)(?<final>.*)/.exec(syl).groups;
    if (!final) return "every syllable must contain at least one vowel";
    if (!initials[initial]) return `a pinyin syllable can't begin with ${initial}`;
    if (parse[initial]) return parse[initial];
    if (parse[final]) return parse[final](initial);
    return `The syllable ${rawsyl} does not exist in pinyin.`;
}

// some initials

parse['hs'] = "hs does not exist in pinyin;\nperhaps you mean x";

parse['ts'] = "ts does not exist in pinyin;\nperhaps you mean z or c";

// the finals

parse['a'] = (initial) => {
    switch (initial) {
    case 'j':
        return "a cannot come directly after j;\nperhaps you mean zha or jia";
    case 'q':
        return "a cannot come directly after q;\nperhaps you mean cha or qia";
    case 'x':
        return "a cannot come directly after x;\nperhaps you mean sha or xia";
    case 'r':
        return "ra is not a syllable in pinyin";
    default:
        return "";
    }
};

parse['ai'] = (initial) => {
    switch (initial) {
    case 'f':
        return "fai is not a syllable in pinyin;\nperhaps you mean fei";
    case 'r':
        return "rai is not a syllable in pinyin";
    case 'j':
        return "ai cannot come after j;\nperhaps you mean zhai";
    case 'q':
        return "ai cannot come after q;\nperhaps you mean chai";
    case 'x':
        return "ai cannot come after x;\nperhaps you mean shai";
    default:
        return "";
    }
};

parse['an'] = (initial) => {
    switch (initial) {
    case 'j':
        return "an cannot come after j;\nperhaps you mean zhan";
    case 'q':
        return "an cannot come after q;\nperhaps you mean chan";
    case 'x':
        return "an cannot come after x;\nperhaps you mean shan";
    default:
        return "";
    }
};

parse['ang'] = (initial) => {
    switch (initial) {
    case 'j':
        return "ang cannot come directly after j;\nperhaps you mean zhang or jiang";
    case 'q':
        return "ang cannot come directly after q;\nperhaps you mean chang or qiang";
    case 'x':
        return "ang cannot come directly after x;\nperhaps you mean shang or xiang";
    default:
        return "";
    }
};

parse['ao'] = (initial) => {
    switch (initial) {
    case 'f':
        return "fao is not a syllable in pinyin";
    case 'j':
        return "ao cannot come directly after j;\nperhaps you mean zhao or jiao";
    case 'q':
        return "ao cannot come directly after q;\nperhaps you mean chao or qiao";
    case 'x':
        return "ao cannot come directly after x;\nperhaps you mean shao or xiao";
    default:
        return "";
    }
};

parse['au'] = () => {
    return "au is written ao in pinyin";
};

parse['ay'] = () => {
    return "ay does not exist in pinyin; perhaps you mean ai or ei";
};

parse['e'] = (initial) => {
    switch (initial) {
    case 'b':
    case 'p':
    case 'f':
        return `${initial}e is not a syllable in pinyin;\nperhaps you mean ${initial}o`;
    case 'j':
        return "e cannot come directly after j;\nperhaps you mean zhe or jie";
    case 'q':
        return "e cannot come directly after q;\nperhaps you mean che or qie";
    case 'x':
        return "e cannot come directly after x;\nperhaps you mean she or xie";
    default:
        return "";
    }
};

parse['ei'] = (initial) => {
    switch (initial) {
    case 's':
    case 'r':
    case 'ch':
        return `${initial}ei is not a syllable in pinyin`;
    case 'j':
        return "ei cannot come after j;\nperhaps you mean zhei";
    case 'q':
        return "ei cannot come after q";
    case 'x':
        return "ei cannot come after x;\nperhaps you mean shei";
    default:
        return "";
    }
};

parse['en'] = (initial) => {
    switch (initial) {
    case 't':
    case 'l':
        return `${initial}en is not a syllable in pinyin;\nperhaps you mean ${initial}eng`;
    case 'j':
        return "en cannot come after j;\nperhaps you mean zhen";
    case 'q':
        return "en cannot come after q;\nperhaps you mean chen";
    case 'x':
        return "en cannot come after x;\nperhaps you mean shen";
    default:
        return "";
    }
};

parse['eng'] = (initial) => {
    switch (initial) {
    case 'j':
        return "eng cannot come after j;\nperhaps you mean zheng";
    case 'q':
        return "eng cannot come after q;\nperhaps you mean cheng";
    case 'x':
        return "eng cannot come after x;\nperhaps you mean sheng";
    default:
        return "";
    }
};

// we are not dealing with erhua in this tutorial
parse['er'] = (initial) => {
    switch (initial) {
    case 'zh':
    case 'ch':
    case 'sh':
        return `${initial}er is not a syllable in pinyin;\nperhaps you mean ${initial}i`;
    default:
        return `${initial}er is not a syllable in pinyin`;
    }
};

parse['ey'] = () => {
    return "ey does not exist in pinyin; perhaps you mean ei";
};

parse['i'] = (initial) => {
    switch (initial) {
    case '':
        return "i should be written yi (a syllable can't begin with i)";
    case 'f':
    case 'g':
    case 'k':
        return `${initial}i is not a syllable in pinyin`;
    case 'h':
        return "hi is not a syllable in pinyin;\nperhaps you mean xi";
    default:
        return "";
    }
};

parse['ia'] = (initial) => {
    switch (initial) {
    case '':
        return "ia should be written ya (a syllable can't begin with i)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'd':
    case 't':
    case 'n':
    case 'g':
    case 'k':
        return `${initial}ia is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `ia cannot come after ${initial};\nperhaps you mean jia`;
    case 'c':
    case 'ch':
        return `ia cannot come after ${initial};\nperhaps you mean qia`;
    case 's':
    case 'sh':
        return `ia cannot come after ${initial};\nperhaps you mean xia`;
    case 'h':
        return "hia is not a syllable in pinyin;\nperhaps you mean xia";
    default:
        return "";
    }
};

parse['ian'] = (initial) => {
    switch (initial) {
    case '':
        return "ian should be written yan (a syllable can't begin with i)";
    case 'f':
    case 'g':
    case 'k':
        return `${initial}ian is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `ian cannot come after ${initial};\nperhaps you mean jian`;
    case 'c':
    case 'ch':
        return `ian cannot come after ${initial};\nperhaps you mean qian`;
    case 's':
    case 'sh':
        return `ian cannot come after ${initial};\nperhaps you mean xian`;
    case 'h':
        return "hian is not a syllable in pinyin;\nperhaps you mean xian";
    default:
        return "";
    }
};

parse['iang'] = (initial) => {
    switch (initial) {
    case '':
        return "iang should be written yang (a syllable can't begin with i)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'd':
    case 't':
    case 'g':
    case 'k':
        return `${initial}iang is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `iang cannot come after ${initial};\nperhaps you mean jiang`;
    case 'c':
    case 'ch':
        return `iang cannot come after ${initial};\nperhaps you mean qiang`;
    case 's':
    case 'sh':
        return `iang cannot come after ${initial};\nperhaps you mean xiang`;
    case 'h':
        return "hiang is not a syllable in pinyin;\nperhaps you mean xiang";
    default:
        return "";
    }
};

parse['iao'] = (initial) => {
    switch (initial) {
    case '':
        return "iao should be written yao (a syllable can't begin with i)";
    case 'f':
    case 'g':
    case 'k':
        return `${initial}iao is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `iao cannot come after ${initial};\nperhaps you mean jiao`;
    case 'c':
    case 'ch':
        return `iao cannot come after ${initial};\nperhaps you mean qiao`;
    case 's':
    case 'sh':
        return `iao cannot come after ${initial};\nperhaps you mean xiao`;
    case 'h':
        return "hiao is not a syllable in pinyin;\nperhaps you mean xiao";
    default:
        return "";
    }
};

parse['iau'] = (initial) => {
    switch (initial) {
    case '':
        return "iau should be written yao (a syllable can't begin with i, and au is written ao)";
    case 'f':
    case 'g':
    case 'k':
        return `iau should be written iao, but ${initial}iao is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `iau should be written iao, but iao cannot come after ${initial};\nperhaps you mean jiao`;
    case 'c':
    case 'ch':
        return `iau should be written iao, but iao cannot come after ${initial};\nperhaps you mean qiao`;
    case 's':
    case 'sh':
        return `iau should be written iao, but iao cannot come after ${initial};\nperhaps you mean xiao`;
    case 'h':
        return "iau should be written iao, but hiao is not a syllable in pinyin;\nperhaps you mean xiao";
    default:
        return `${initial}iau should be written ${initial}iao`;
    }
};

parse['ie'] = (initial) => {
    switch (initial) {
    case '':
        return "ie should be written ye (a syllable can't begin with i)";
    case 'f':
    case 'g':
    case 'k':
        return `${initial}ie is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `ie cannot come after ${initial};\nperhaps you mean jie`;
    case 'c':
    case 'ch':
        return `ie cannot come after ${initial};\nperhaps you mean qie`;
    case 's':
    case 'sh':
        return `ie cannot come after ${initial};\nperhaps you mean xie`;
    case 'h':
        return "hie is not a syllable in pinyin;\nperhaps you mean xie";
    default:
        return "";
    }
};

parse['ien'] = (initial) => {
    switch (initial) {
    case '':
        return "ien should be written yan (a syllable can't begin with i, and yen is written yan)";
    case 'f':
    case 'g':
    case 'k':
        return `ien should be written ian, but ${initial}ian is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `ien should be written ian, but ian cannot come after ${initial};\nperhaps you mean jian`;
    case 'c':
    case 'ch':
        return `ien should be written ian, but ian cannot come after ${initial};\nperhaps you mean qian`;
    case 's':
    case 'sh':
        return `ien should be written ian, but ian cannot come after ${initial};\nperhaps you mean xian`;
    case 'h':
        return "ien should be written ian, but hian is not a syllable in pinyin;\nperhaps you mean xian";
    default:
        return `${initial}ien should be written ${initial}ian`;
    }
};

parse['in'] = (initial) => {
    switch (initial) {
    case '':
        return "in should be written yin (a syllable can't begin with i)";
    case 'f':
    case 'd':
    case 't':
    case 'g':
    case 'k':
        return `${initial}in is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `in cannot come after ${initial};\nperhaps you mean jin`;
    case 'c':
    case 'ch':
        return `in cannot come after ${initial};\nperhaps you mean qin`;
    case 's':
    case 'sh':
        return `in cannot come after ${initial};\nperhaps you mean xin`;
    case 'h':
        return "hin is not a syllable in pinyin;\nperhaps you mean xin";
    default:
        return "";
    }
};

parse['ing'] = (initial) => {
    switch (initial) {
    case '':
        return "ing should be written ying (a syllable can't begin with i)";
    case 'f':
    case 'g':
    case 'k':
        return `${initial}ing is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `ing cannot come after ${initial};\nperhaps you mean jing`;
    case 'c':
    case 'ch':
        return `ing cannot come after ${initial};\nperhaps you mean qing`;
    case 's':
    case 'sh':
        return `ing cannot come after ${initial};\nperhaps you mean xing`;
    case 'h':
        return "hing is not a syllable in pinyin;\nperhaps you mean xing";
    default:
        return "";
    }
};

parse['iong'] = (initial) => {
    switch (initial) {
    case '':
        return "iong should be written yong (a syllable can't begin with i)";
    case 'j':
    case 'q':
    case 'x':
        return "";
    case 'z':
    case 'zh':
        return `iong cannot come after ${initial};\nperhaps you mean jiong`;
    case 'c':
    case 'ch':
        return `iong cannot come after ${initial};\nperhaps you mean qiong`;
    case 's':
    case 'sh':
        return `iong cannot come after ${initial};\nperhaps you mean xiong`;
    case 'h':
        return "hiong is not a syllable in pinyin;\nperhaps you mean xiong";
    default:
        return `${initial}iong is not a syllable in pinyin`;
    }
};

parse['iou'] = (initial) => {
    switch (initial) {
    case '':
        return "iou should be written you (a syllable can't begin with i)";
    case 'm':
    case 'd':
    case 'n':
    case 'l':
    case 'j':
    case 'q':
    case 'x':
        return `iou after consonant becomes iu;\n${initial}iou should be written ${initial}iu`;
    case 'z':
    case 'zh':
        return `iou after consonant becomes iu, but iu cannot come after ${initial};\nperhaps you mean jiu`;
    case 'c':
    case 'ch':
        return `iou after consonant becomes iu, but iu cannot come after ${initial};\nperhaps you mean qiu`;
    case 's':
    case 'sh':
        return `iou after consonant becomes iu, but iu cannot come after ${initial};\nperhaps you mean xiu`;
    case 'h':
        return "iou after consonant becomes iu, but hiu is not a syllable in pinyin;\nperhaps you mean xiu";
    default:
        return `iou after consonant becomes iu, but ${initial}iu is not a syllable in pinyin`;
    }
};

parse['ir'] = (initial) => {
    switch (initial) {
    case '':
        return "ir should be written as ri";
    case 'zh':
    case 'ch':
    case 'sh':
    case 'r':
        return `${initial}ir should be written as ${initial}i`;
    default:
        return `${initial}ir is not a syllable in pinyin`;
    }
};

parse['iu'] = (initial) => {
    switch (initial) {
    case '':
        return "iu should be written you (a syllable can't begin with i;\nspecial spelling rule)";
    case 'b':
    case 'p':
    case 'f':
    case 't':
    case 'g':
    case 'k':
        return `${initial}iu is not a syllable in pinyin`;
    case 'z':
    case 'zh':
        return `iu cannot come after ${initial};\nperhaps you mean jiu`;
    case 'c':
    case 'ch':
        return `iu cannot come after ${initial};\nperhaps you mean qiu`;
    case 's':
    case 'sh':
        return `iu cannot come after ${initial};\nperhaps you mean xiu`;
    case 'h':
        return "hiu is not a syllable in pinyin;\nperhaps you mean xiu";
    default:
        return "";
    }
};

parse['o'] = (initial) => {
    switch (initial) {
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'z':
    case 'c':
    case 's':
    case 'zh':
    case 'ch':
    case 'sh':
    case 'r':
    case 'g':
    case 'k':
    case 'h':
        return `${initial}o is not a syllable in pinyin;\nperhaps you mean ${initial}ou or ${initial}uo`;
    case 'j':
        return "o cannot come directly after j, and o should be ou;\nperhaps you mean zhou or jiu";
    case 'q':
        return "o cannot come directly after q, and o should be ou;\nperhaps you mean chou or qiu";
    case 'x':
        return "o cannot come directly after x, and o should be ou;\nperhaps you mean shou or xiu";
    default:
        return "";
    }
};

parse['ong'] = (initial) => {
    switch (initial) {
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'sh':
        return `${initial}ong is not a syllable in pinyin;\nperhaps you mean ${initial}ang or ${initial}eng`;
    case 'j':
        return "ong cannot come directly after j;\nperhaps you mean zhong or jiong";
    case 'q':
        return "ong cannot come directly after q;\nperhaps you mean chong or qiong";
    case 'x':
        return "ong cannot come directly after x;\nperhaps you mean shong or xiong";
    default:
        return "";
    }
};

parse['ou'] = (initial) => {
    switch (initial) {
    case 'b':
        return "bou is not a syllable in pinyin;\nperhaps you mean bo";
    case 'j':
        return "ou cannot come directly after j;\nperhaps you mean zhou or jiu";
    case 'q':
        return "ou cannot come directly after q;\nperhaps you mean chou or qiu";
    case 'x':
        return "ou cannot come directly after x;\nperhaps you mean shou or xiu";
    default:
        return "";
    }
};

parse['ow'] = () => {
    return "ow does not exist in pinyin;\nperhaps you mean ao or ou";
};

parse['u'] = (initial) => {
    switch (initial) {
    case '':
        return "u should be written wu (a syllable can't begin with u)";
    default:
        return "";
    }
};

parse['ua'] = (initial) => {
    switch (initial) {
    case '':
        return "ua should be written wa (a syllable can't begin with u)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'z':
    case 'c':
    case 's':
        return `${initial}ua is not a syllable in pinyin`;
    case 'j':
        return "ua cannot come after j;\nperhaps you mean zhua";
    case 'q':
        return "ua cannot come after q;\nperhaps you mean chua";
    case 'x':
        return "ua cannot come after x;\nperhaps you mean shua";
    default:
        return "";
    }
};

parse['uai'] = (initial) => {
    switch (initial) {
    case '':
        return "uai should be written wai (a syllable can't begin with u)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'z':
    case 'c':
    case 's':
    case 'r':
        return `${initial}uai is not a syllable in pinyin`;
    case 'j':
        return "uai cannot come after j;\nperhaps you mean zhuai";
    case 'q':
        return "uai cannot come after q;\nperhaps you mean chuai";
    case 'x':
        return "uai cannot come after x;\nperhaps you mean shuai";
    default:
        return "";
    }
};

parse['uan'] = (initial) => {
    switch (initial) {
    case '':
        return "uan should be written wan (a syllable can't begin with u)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
        return `${initial}uan is not a syllable in pinyin`;
    default:
        return "";
    }
};

parse['uang'] = (initial) => {
    switch (initial) {
    case '':
        return "uang should be written wang (a syllable can't begin with u)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'z':
    case 'c':
    case 's':
    case 'r':
        return `${initial}uang is not a syllable in pinyin`;
    case 'j':
        return "uang cannot come after j;\nperhaps you mean zhuang";
    case 'q':
        return "uang cannot come after q;\nperhaps you mean chuang";
    case 'x':
        return "uang cannot come after x;\nperhaps you mean shuang";
    default:
        return "";
    }
};

parse['ue'] = (initial) => {
    switch (initial) {
    case 'j':
    case 'q':
    case 'x':
        return "";
    case 'z':
        return "zue is not a syllable in pinyin;\nperhaps you mean zui or jue";
    case 'c':
        return "cue is not a syllable in pinyin;\nperhaps you mean cui or que";
    case 's':
        return "sue is not a syllable in pinyin;\nperhaps you mean sui or xue";
    case 'zh':
        return "zhue is not a syllable in pinyin;\nperhaps you mean zhui or jue";
    case 'ch':
        return "chue is not a syllable in pinyin;\nperhaps you mean chui or que";
    case 'sh':
        return "shue is not a syllable in pinyin;\nperhaps you mean shui or xue";
    case 'r':
        return "rue is not a syllable in pinyin;\nperhaps you mean rui";
    default:
        return `${initial} is not a syllable in pinyin`;
    }
};

parse['uei'] = (initial) => {
    switch (initial) {
    case '':
        return "uei should be written wei (a syllable can't begin with u)";
    case 'd':
    case 't':
    case 'z':
    case 'c':
    case 's':
    case 'zh':
    case 'ch':
    case 'sh':
    case 'r':
    case 'g':
    case 'k':
    case 'h':
        return `uei after consonant becomes ui;\n${initial}uei should be written ${initial}ui`;
    case 'j':
        return `uei after consonant becomes ui, but ui cannot come after ${initial};\nperhaps you mean zhui`;
    case 'q':
        return `uei after consonant becomes ui, but ui cannot come after ${initial};\nperhaps you mean chui`;
    case 'x':
        return `uei after consonant becomes ui, but ui cannot come after ${initial};\nperhaps you mean shui`;
    default:
        return `uei after consonant becomes ui, but ${initial}ui is not a syllable in pinyin`;
    }
};

parse['uen'] = (initial) => {
    switch (initial) {
    case '':
        return "uen should be written wen (a syllable can't begin with u)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'n':
        return `uen after consonant becomes un, but ${initial}un is not a syllable in pinyin`;
    case 'j':
    case 'q':
    case 'x':
        return `${initial}uen is not a syllable in pinyin;\nperhaps you mean ${initial}uan`;
    default:
        return `uen after consonant becomes un;\n${initial}uen should be written ${initial}un`;
    }
};

parse['ueng'] = (initial) => {
    switch (initial) {
    case '':
        return "ueng should be written weng (a syllable can't begin with u)";
    default:
        return `${initial}ueng is not a syllable in pinyin`;
    }
};

parse['uh'] = () => {
    return "uh does not exist in pinyin;\nperhaps you mean e";
};

parse['ui'] = (initial) => {
    switch (initial) {
    case '':
        return "ui should be written wei (a syllable can't begin with u;\nspecial spelling rule)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'n':
    case 'l':
        return `${initial}ui is not a syllable in pinyin`;
    case 'j':
        return `ui cannot come after ${initial};\nperhaps you mean zhui`;
    case 'q':
        return `ui cannot come after ${initial};\nperhaps you mean chui`;
    case 'x':
        return `ui cannot come after ${initial};\nperhaps you mean shui`;
    default:
        return "";
    }
};

parse['un'] = (initial) => {
    switch (initial) {
    case '':
        return "un should be written wen (a syllable can't begin with u;\nspecial spelling rule)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'n':
        return `${initial}un is not a syllable in pinyin`;
    default:
        return "";
    }
};

parse['ung'] = (initial) => {
    switch (initial) {
    case 'j':
        return "jung is not a syllable in pinyin; perhaps you mean zheng";
    case 'q':
        return "qung is not a syllable in pinyin; perhaps you mean cheng";
    case 'x':
        return "xung is not a syllable in pinyin; perhaps you mean heng";
    default:
        return `${initial}ung is not a syllable in pinyin; perhaps you mean ${initial}eng`;
    }
};

parse['uo'] = (initial) => {
    switch (initial) {
    case '':
        return "uo should be written wo (a syllable can't begin with u)";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
        return `${initial}uo is written ${initial}o;\nspecial spelling rule`;
    case 'j':
        return "uo cannot come after j;\nperhaps you mean zhuo";
    case 'q':
        return "uo cannot come after q;\nperhaps you mean chuo";
    case 'x':
        return "uo cannot come after x;\nperhaps you mean shuo";
    default:
        return "";
    }
};

parse['ü'] = (initial) => {
    switch (initial) {
    case '':
        return "ü should be written yu (a syllable beginning with ü changes it to yu)";
    case 'j':
    case 'q':
    case 'x':
        return `ü loses its umlaut after ${initial};\nperhaps you mean ${initial}u`;
    case 'n':
    case 'l':
        return "";
    default:
        return `${initial}ü is not a syllable in pinyin`;
    }
};

parse['üan'] = (initial) => {
    switch (initial) {
    case '':
        return "üan should be written yuan (a syllable beginning with ü changes it to yuan)";
    case 'j':
    case 'q':
    case 'x':
        return `ü loses its umlaut after ${initial};\nperhaps you mean ${initial}uan`;
    default:
        return `${initial}üan is not a syllable in pinyin`;
    }
};

parse['üe'] = (initial) => {
    switch (initial) {
    case '':
        return "üe should be written yue (a syllable beginning with ü changes it to yu)";
    case 'j':
    case 'q':
    case 'x':
        return `ü loses its umlaut after ${initial};\nperhaps you mean ${initial}ue`;
    case 'n':
    case 'l':
        return "";
    default:
        return `${initial}üe is not a syllable in pinyin`;
    }
};

parse['ün'] = (initial) => {
    switch (initial) {
    case '':
        return "ün should be written yun (a syllable beginning with ü changes it to yu)";
    case 'j':
    case 'q':
    case 'x':
        return `ü loses its umlaut after ${initial};\nperhaps you mean ${initial}un`;
    default:
        return `${initial}ün is not a syllable in pinyin`;
    }
};

parse['wa'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'g':
    case 'k':
    case 'h':
    case 'z':
    case 'zh':
    case 'c':
    case 'ch':
    case 's':
    case 'sh':
        return `wa becomes ua after consonant;\n${initial}wa should be written ${initial}ua`;
    case 'j':
        return "wa becomes ua after consonant, but ua cannot come after j;\nperhaps you mean zhua";
    case 'q':
        return "wa becomes ua after consonant, but ua cannot come after q;\nperhaps you mean chua";
    case 'x':
        return "wa becomes ua after consonant, but ua cannot come after x;\nperhaps you mean shua";
    default:
        return `wa becomes ua after consonant, but ${initial}ua is not a syllable in pinyin`;
    }
};

parse['wai'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'z':
    case 'c':
    case 's':
    case 'r':
        return `wai becomes uai after consonant, but ${initial}uai is not a syllable in pinyin`;
    case 'j':
        return "wai becomes uai after consonant, but uai cannot come after j;\nperhaps you mean zhuai";
    case 'q':
        return "wai becomes uai after consonant, but uai cannot come after q;\nperhaps you mean chuai";
    case 'x':
        return "wai becomes uai after consonant, but uai cannot come after x;\nperhaps you mean shuai";
    default:
        return `wai becomes uai after consonant;\n${initial}wai should be written ${initial}uai`;
    }
};

parse['wan'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
        return `wan becomes uan after consonant, but ${initial}uan is not a syllable in pinyin`;
    default:
        return `wan becomes uan after consonant;\n${initial}wan should be written ${initial}uan`;
    }
};

parse['wang'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'z':
    case 'c':
    case 's':
    case 'r':
        return `wang becomes uang after consonant, but ${initial}uang is not a syllable in pinyin`;
    case 'j':
        return "wang becomes uang after consonant, but uang cannot come after j;\nperhaps you mean zhuang";
    case 'q':
        return "wang becomes uang after consonant, but uang cannot come after q;\nperhaps you mean chuang";
    case 'x':
        return "wang becomes uang after consonant, but uang cannot come after x;\nperhaps you mean shuang";
    default:
        return `wang becomes uang after consonant;\n${initial}wang should be written ${initial}uang`;
    }
};

parse['wei'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'd':
    case 't':
    case 'z':
    case 'c':
    case 's':
    case 'zh':
    case 'ch':
    case 'sh':
    case 'r':
    case 'g':
    case 'k':
    case 'h':
        return `wei after consonant becomes ui;\n${initial}wei should be written ${initial}ui`;
    case 'j':
        return `wei after consonant becomes ui, but ui cannot come after ${initial};\nperhaps you mean zhui`;
    case 'q':
        return `wei after consonant becomes ui, but ui cannot come after ${initial};\nperhaps you mean chui`;
    case 'x':
        return `wei after consonant becomes ui, but ui cannot come after ${initial};\nperhaps you mean shui`;
    default:
        return `wei after consonant becomes ui, but ${initial}ui is not a syllable in pinyin`;
    }
};

parse['wen'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'n':
        return `wen after consonant becomes un, but ${initial}un is not a syllable in pinyin`;
    case 'j':
    case 'q':
    case 'x':
        return `wen after consonant becomes un, but ${initial}uen is not a syllable in pinyin;\nperhaps you mean ${initial}uan`;
    default:
        return `wen after consonant becomes un;\n${initial}wen should be written ${initial}un`;
    }
};

parse['weng'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    default:
        return `${initial}weng is not a syllable in pinyin`;
    }
};

parse['wo'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
        return `wo becomes uo after consonant, but ${initial}uo is written ${initial}o (special case)`;
    case 'j':
        return "wo becomes uo after consonant, but uo cannot come after j;\nperhaps you mean zhuo";
    case 'q':
        return "wo becomes uo after consonant, but uo cannot come after q;\nperhaps you mean chuo";
    case 'x':
        return "wo becomes uo after consonant, but uo cannot come after x;\nperhaps you mean shuo";
    default:
        return `wo becomes uo after consonant;\n${initial}wo should be written ${initial}uo`;
    }
};

parse['wong'] = (initial) => {
    switch (initial) {
    case '':
        return "wong is not a syllable in pinyin; perhaps you mean wang";
    case 'b':
    case 'p':
    case 'm':
    case 'f':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'z':
    case 'c':
    case 's':
    case 'r':
        return `wong does not exist in pinyin;\nuang is possible after consonants, but ${initial}uang is not a syllable in pinyin`;
    case 'j':
        return "wong does not exist in pinyin;\nuang is possible after consonants, but uang cannot come after j;\nperhaps you mean zhuang";
    case 'q':
        return "wong does not exist in pinyin;\nuang is possible after consonants, but uang cannot come after q;\nperhaps you mean chuang";
    case 'x':
        return "wong does not exist in pinyin;\nuang is possible after consonants, but uang cannot come after x;\nperhaps you mean shuang";
    default:
        return `wong does not exist in pinyin;\nuang is possible after consonants; perhaps you mean ${initial}uang`;
    }
};

parse['wu'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    default:
        return `${initial}wu is not a syllable in pinyin;\nperhaps you have an extra w`;
    }
};

parse['wun'] = (initial) => {
    switch (initial) {
    case '':
        return "wun should be written wen";
    default:
        return `${initial}wun is not a syllable in pinyin;\nperhaps you have an extra w`;
    }
};

parse['ya'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'l':
    case 'j':
    case 'q':
    case 'x':
        return `ya becomes ia after consonant;\n${initial}ya should be written ${initial}ia`;
    case 'z':
    case 'zh':
        return `ya becomes ia after consonant, but ia cannot come after ${initial};\nperhaps you mean jia`;
    case 'c':
    case 'ch':
        return `ya becomes ia after consonant, but ia cannot come after ${initial};\nperhaps you mean qia`;
    case 's':
    case 'sh':
        return `ya becomes ia after consonant, but ia cannot come after ${initial};\nperhaps you mean xia`;
    case 'h':
        return "ya becomes ia after consonant, but hia is not a syllable in pinyin;\nperhaps you mean xia";
    default:
        return `ya becomes ia after consonant, but ${initial}ia is not a syllable in pinyin`;
    }
};

parse['yan'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'b':
    case 'p':
    case 'm':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'j':
    case 'q':
    case 'x':
        return `yan becomes ian after consonant;\n${initial}yan should be written ${initial}ian`;
    case 'z':
    case 'zh':
        return `yan becomes ian after consonant, but ian cannot come after ${initial};\nperhaps you mean jian`;
    case 'c':
    case 'ch':
        return `yan becomes ian after consonant, but ian cannot come after ${initial};\nperhaps you mean qian`;
    case 's':
    case 'sh':
        return `yan becomes ian after consonant, but ian cannot come after ${initial};\nperhaps you mean xian`;
    case 'h':
        return "yan becomes ian after consonant, but hian is not a syllable in pinyin;\nperhaps you mean xian";
    default:
        return `yan becomes ian after consonant, but ${initial}ian is not a syllable in pinyin`;
    }
};

parse['yang'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'n':
    case 'l':
    case 'j':
    case 'q':
    case 'x':
        return `yang becomes iang after consonant;\n${initial}yang should be written ${initial}iang`;
    case 'z':
    case 'zh':
        return `yang becomes iang after consonant, but iang cannot come after ${initial};\nperhaps you mean jiang`;
    case 'c':
    case 'ch':
        return `yang becomes iang after consonant, but iang cannot come after ${initial};\nperhaps you mean qiang`;
    case 's':
    case 'sh':
        return `yang becomes iang after consonant, but iang cannot come after ${initial};\nperhaps you mean xiang`;
    case 'h':
        return "yang becomes iang after consonant, but hiang is not a syllable in pinyin;\nperhaps you mean xiang";
    default:
        return `yang becomes iang after consonant, but ${initial}iang is not a syllable in pinyin`;
    }
};

parse['yao'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'b':
    case 'p':
    case 'm':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'j':
    case 'q':
    case 'x':
        return `yao becomes iao after consonant;\n${initial}yao should be written ${initial}iao`;
    case 'z':
    case 'zh':
        return `yao becomes iao after consonant, but iao cannot come after ${initial};\nperhaps you mean jiao`;
    case 'c':
    case 'ch':
        return `yao becomes iao after consonant, but iao cannot come after ${initial};\nperhaps you mean qiao`;
    case 's':
    case 'sh':
        return `yao becomes iao after consonant, but iao cannot come after ${initial};\nperhaps you mean xiao`;
    case 'h':
        return "yao becomes iao after consonant, but hiao is not a syllable in pinyin;\nperhaps you mean xiao";
    default:
        return `yao becomes iao after consonant, but ${initial}iao is not a syllable in pinyin`;
    }
};

parse['yau'] = (initial) => {
    switch (initial) {
    case '':
        return "yau should be written yao";
    case 'b':
    case 'p':
    case 'm':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'j':
    case 'q':
    case 'x':
        return `yau should be written yao, which becomes iao after consonant;\n${initial}yao should be written ${initial}iao`;
    case 'z':
    case 'zh':
        return `yau should be written yao, which becomes iao after consonant, but iao cannot come after ${initial};\nperhaps you mean jiao`;
    case 'c':
    case 'ch':
        return `yau should be written yao, which becomes iao after consonant, but iao cannot come after ${initial};\nperhaps you mean qiao`;
    case 's':
    case 'sh':
        return `yau should be written yao, which becomes iao after consonant, but iao cannot come after ${initial};\nperhaps you mean xiao`;
    case 'h':
        return "yau should be written yao, which becomes iao after consonant, but hiao is not a syllable in pinyin;\nperhaps you mean xiao";
    default:
        return `yau should be written yao, which becomes iao after consonant, but ${initial}iao is not a syllable in pinyin`;
    }
};

parse['ye'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'b':
    case 'p':
    case 'm':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'j':
    case 'q':
    case 'x':
        return `ye becomes ie after consonant;\n${initial}ye should be written ${initial}ie`;
    case 'z':
    case 'zh':
        return `ye becomes ie after consonant, but ie cannot come after ${initial};\nperhaps you mean jie`;
    case 'c':
    case 'ch':
        return `ye becomes ie after consonant, but ie cannot come after ${initial};\nperhaps you mean qie`;
    case 's':
    case 'sh':
        return `ye becomes ie after consonant, but ie cannot come after ${initial};\nperhaps you mean xie`;
    case 'h':
        return "ye becomes ie after consonant, but hie is not a syllable in pinyin;\nperhaps you mean xie";
    default:
        return `ye becomes ie after consonant, but ${initial}ie is not a syllable in pinyin`;
    }
};

parse['yen'] = (initial) => {
    switch (initial) {
    case '':
        return "yen is not a syllable in pinyin;\nperhaps you mean yan";
    case 'b':
    case 'p':
    case 'm':
    case 'd':
    case 't':
    case 'n':
    case 'l':
    case 'j':
    case 'q':
    case 'x':
        return `yen does not exist in pinyin;\nian is possible after consonants; perhaps you mean ${initial}ian`;
    case 'z':
    case 'zh':
        return `yen does not exist in pinyin;\nian is possible after consonants, but not after ${initial};\nperhaps you mean jian`;
    case 'c':
    case 'ch':
        return `yen does not exist in pinyin;\nian is possible after consonants, but not after ${initial};\nperhaps you mean qian`;
    case 's':
    case 'sh':
        return `yen does not exist in pinyin;\nian is possible after consonants, but not after ${initial};\nperhaps you mean xian`;
    case 'h':
        return "yen does not exist in pinyin;\nian is possible after consonants, but hian is not a syllable; perhaps you mean xian";
    }
};

parse['yi'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    default:
        return `${initial}yi is not a syllable in pinyin;\nperhaps you have an extra y`;
    }
};

parse['yin'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    default:
        return `${initial}yin is not a syllable in pinyin;\nperhaps you have an extra y`;
    }
};

parse['ying'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    default:
        return `${initial}ying is not a syllable in pinyin;\nperhaps you have an extra y`;
    }
};

parse['yong'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'j':
    case 'q':
    case 'x':
        return `yong becomes iong after consonant;\n${initial}yong should be written ${initial}iong`;
    case 'z':
    case 'zh':
        return `yong becomes iong after consonant, but iong cannot come after ${initial};\nperhaps you mean jiong`;
    case 'c':
    case 'ch':
        return `yong becomes iong after consonant, but iong cannot come after ${initial};\nperhaps you mean qiong`;
    case 's':
    case 'sh':
        return `yong becomes iong after consonant, but iong cannot come after ${initial};\nperhaps you mean xiong`;
    case 'h':
        return "yong becomes iong after consonant, but hiong is not a syllable in pinyin;\nperhaps you mean xiong";
    default:
        return `yong becomes iong after consonant, but ${initial}iong is not a syllable in pinyin`;
    }
};

parse['you'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'm':
    case 'd':
    case 'n':
    case 'l':
    case 'j':
    case 'q':
    case 'x':
        return `you becomes iu after consonant;\n${initial}you should be written ${initial}iu`;
    case 'z':
    case 'zh':
        return `you becomes iu after consonant, but iu cannot come after ${initial};\nperhaps you mean jiu`;
    case 'c':
    case 'ch':
        return `you becomes iu after consonant, but iu cannot come after ${initial};\nperhaps you mean qiu`;
    case 's':
    case 'sh':
        return `you becomes iu after consonant, but iu cannot come after ${initial};\nperhaps you mean xiu`;
    case 'h':
        return "you becomes iu after consonant, but hiu is not a syllable in pinyin;\nperhaps you mean xiu";
    default:
        return `you becomes iu after consonant, but ${initial}iu is not a syllable in pinyin`;
    }
};

parse['yu'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'j':
    case 'q':
    case 'x':
        return `${initial}yu should be written ${initial}u`;
    case 'n':
    case 'l':
        return `${initial}yu should be written ${initial}ü`;
    default:
        return `yu would become ü after consonant, but ü never follows ${initial} in pinyin`; // do likewise elsewhere?
    }
};

parse['yuan'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'j':
    case 'q':
    case 'x':
        return `yuan becomes uan after ${initial};\n${initial}yuan should be written ${initial}uan`;
    default:
        return `yuan would become üan after consonant, but ${initial}üan is not a syllable in pinyin`;
    }
};

parse['yue'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'j':
    case 'q':
    case 'x':
        return `yue becomes ue after ${initial};\n${initial}yue should be written ${initial}ue`;
    case 'n':
    case 'l':
        return `yue becomes üe after ${initial};\n${initial}yue should be written ${initial}üe`;
    default:
        return `yue would become üe after consonant, but ${initial}üe is not a syllable in pinyin`;
    }
};

parse['yun'] = (initial) => {
    switch (initial) {
    case '':
        return "";
    case 'j':
    case 'q':
    case 'x':
        return `yun becomes un after ${initial};\n${initial}yun should be written ${initial}un`;
    default:
        return `yun would become ün after consonant, but ${initial}ün is not a syllable in pinyin`;
    }
};

parse['yü'] = (initial) => {
    switch (initial) {
    case '':
        return "ü loses its umlaut after y;\nyü should be written yu";
    case 'j':
    case 'q':
    case 'x':
        return `${initial}yü should be written ${initial}u`;
    case 'n':
    case 'l':
        return `${initial}yü should be written ${initial}ü`;
    default:
        return `yü would become ü after consonant, but ${initial}ü is not a syllable in pinyin`;
    }
};

parse['yüan'] = (initial) => {
    switch (initial) {
    case '':
        return "ü loses its umlaut after y;\nyüan should be written yuan";
    case 'j':
    case 'q':
    case 'x':
        return `yüan is written yuan, which becomes uan after ${initial};\n${initial}yüan should be written ${initial}uan`;
    default:
        return `yüan is written yuan, which would become üan after consonant, but ${initial}üan is not a syllable in pinyin`;
    }
};

parse['yüe'] = (initial) => {
    switch (initial) {
    case '':
        return "ü loses its umlaut after y;\nyüe should be written yue";
    case 'j':
    case 'q':
    case 'x':
        return `${initial}yüe should be written ${initial}ue`;
    case 'n':
    case 'l':
        return `${initial}yüe should be written ${initial}üe`;
    default:
        return `yüe is written yue, which would become üe after consonant, but ${initial}üe is not a syllable in pinyin`;
    }
};

parse['yün'] = (initial) => {
    switch (initial) {
    case '':
        return "ü loses its umlaut after y;\nyün should be written yun";
    case 'j':
    case 'q':
    case 'x':
        return `yün is written yun, which becomes un after ${initial};\n${initial}yun should be written ${initial}un`;
    default:
        return `yün is written yun, which would become ün after consonant, but ${initial}ün is not a syllable in pinyin`;
    }
};

// some simple ways of doing things

parse['way'] = () => {
    return parse['ay']();
};

parse['wey'] = () => {
    return parse['ey']();
};

parse['yow'] = () => {
    return parse['ow']();
};
