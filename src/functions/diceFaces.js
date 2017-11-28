var dice = {
  yellow: {
    1: {face: '', adjacent: ['s', 'ss', 'sa', 'sa', 'aa'], adjacentposition: [2, 5, 7, 8, 11]},
    2: {face: 's', adjacent: ['', 'a', 'ss', 'sa', 'aa'], adjacentposition: [1, 6, 4, 9, 11]},
    3: {face: 's', adjacent: ['ss', 'sa', 'sa', 'aa', 'r'], adjacentposition: [4, 7, 8, 10, 12]},
    4: {face: 'ss', adjacent: ['s', 'a', 'sa', 'aa', 'r'], adjacentposition: [3, 6, 7, 11, 12]},
    5: {face: 'ss', adjacent: ['', 's', 'sa', 'sa', 'aa'], adjacentposition: [1, 2, 9, 8, 10]},
    6: {face: 'a', adjacent: ['s', 'ss', 'sa', 'aa', 'r'], adjacentposition: [2, 4, 9, 10, 12]},
    7: {face: 'sa', adjacent: ['', 's', 'ss', 'sa', 'aa'], adjacentposition: [1, 3, 5, 8, 10]},
    8: {face: 'sa', adjacent: ['', 's', 'ss', 'sa', 'aa'], adjacentposition: [1, 3, 4, 7, 11]},
    9: {face: 'sa', adjacent: ['s', 'a', 'ss', 'aa', 'r'], adjacentposition: [2, 6, 5, 10, 12]},
    10: {face: 'aa', adjacent: ['s', 'ss', 'sa', 'sa', 'r'], adjacentposition: [3, 5, 9, 7, 12]},
    11: {face: 'aa', adjacent: ['', 's', 'a', 'ss', 'sa'], adjacentposition: [1, 2, 6, 4, 8]},
    12: {face: 'r', adjacent: ['s', 'a', 'ss', 'sa', 'aa'], adjacentposition: [3, 6, 4, 9, 10]}
  },
  green: {
    1: {face: '', adjacent: ['s', 'a', 'aa'], adjacentposition: [3, 5, 8]},
    2: {face: 's', adjacent: ['a', 'sa', 'aa'], adjacentposition: [6, 7, 8]},
    3: {face: 's', adjacent: ['', 'a', 'ss'], adjacentposition: [1, 4, 5]},
    4: {face: 'ss', adjacent: ['s', 'a', 'sa'], adjacentposition: [3, 5, 7]},
    5: {face: 'a', adjacent: ['', 's', 'ss'], adjacentposition: [1, 2, 4]},
    6: {face: 'a', adjacent: ['s', 'sa', 'aa'], adjacentposition: [3, 8, 7]},
    7: {face: 'sa', adjacent: ['s', 'a', 'ss'], adjacentposition: [2, 4, 6]},
    8: {face: 'aa', adjacent: ['', 's', 'a'], adjacentposition: [1, 2, 6]}
  },
  blue: {
    1: {face: '', adjacent: ['s', 'sa', 'aa', 'a'], adjacentposition: [3, 4, 5, 6]},
    2: {face: '', adjacent: ['s', 'sa', 'aa', 'a'], adjacentposition: [3, 4, 5, 6]},
    3: {face: 's', adjacent: ['', '', 'sa', 'aa'], adjacentposition: [1, 2, 4, 5]},
    4: {face: 'sa', adjacent: ['', '', 's', 'a'], adjacentposition: [1, 2, 3, 6]},
    5: {face: 'aa', adjacent: ['', '', 's', 'a'], adjacentposition: [1, 2, 3, 6]},
    6: {face: 'a', adjacent: ['', '', 'sa', 'aa'], adjacentposition: [1, 2, 4, 5]}
  },
  red: {
    1: {face: '', adjacent: ['f', 't', 'ff', 'ft', 'tt'], adjacentposition: [2, 6, 4, 8, 10]},
    2: {face: 'f', adjacent: ['', 't', 'ff', 'ft', 'tt'], adjacentposition: [1, 6, 9, 10, 11]},
    3: {face: 'f', adjacent: ['t', 'ff', 'ft', 'tt', 'd'], adjacentposition: [4, 5, 7, 8, 10]},
    4: {face: 'ff', adjacent: ['', 'f', 't', 'ft', 'tt'], adjacentposition: [1, 2, 3, 6, 8]},
    5: {face: 'ff', adjacent: ['f', 't', 'ft', 'tt', 'd'], adjacentposition: [7, 9, 10, 11, 12]},
    6: {face: 't', adjacent: ['', 'f', 'ff', 'ft', 'tt'], adjacentposition: [1, 2, 4, 9, 11]},
    7: {face: 't', adjacent: ['f', 'ff', 'ft', 'tt', 'd'], adjacentposition: [3, 5, 8, 10, 12]},
    8: {face: 'ft', adjacent: ['', 'f', 't', 'ff', 'tt'], adjacentposition: [1, 3, 4, 7, 10]},
    9: {face: 'ft', adjacent: ['f', 't', 'ff', 'tt', 'd'], adjacentposition: [2, 5, 6, 11, 12]},
    10: {face: 'tt', adjacent: ['', 'f', 't', 'ff', 'ft'], adjacentposition: [1, 2, 5, 7, 8]},
    11: {face: 'tt', adjacent: ['f', 't', 'ff', 'ft', 'd'], adjacentposition: [3, 4, 6, 9, 12]},
    12: {face: 'd', adjacent: ['f', 't', 'ff', 'ft', 'tt'], adjacentposition: [3, 7, 5, 9, 11]}
  },
  purple: {
    1: {face: '', adjacent: ['ff', 'ft', 'tt'], adjacentposition: [3, 7, 8]},
    2: {face: 'f', adjacent: ['t', 't', 't'], adjacentposition: [4, 5, 6]},
    3: {face: 'ff', adjacent: ['', 't', 't'], adjacentposition: [1, 5, 6]},
    4: {face: 't', adjacent: ['f', 'ft', 'tt'], adjacentposition: [2, 7, 8]},
    5: {face: 't', adjacent: ['f', 'ft', 'ff'], adjacentposition: [2, 3, 8]},
    6: {face: 't', adjacent: ['f', 'ff', 'tt'], adjacentposition: [2, 3, 7 ]},
    7: {face: 'tt', adjacent: ['', 't', 't'], adjacentposition: [1, 4, 6]},
    8: {face: 'ft', adjacent: ['', 't', 't'], adjacentposition: [1, 4, 5, ]}
  },
  black: {
    1: {face: '', adjacent: ['f', 'f', 't', 't'], adjacentposition: [3, 4, 5, 6]},
    2: {face: '', adjacent: ['f', 'f', 't', 't'], adjacentposition: [3, 4, 5, 6]},
    3: {face: 'f', adjacent: ['', '', 't', 't'], adjacentposition: [1, 2, 5, 6]},
    4: {face: 'f', adjacent: ['', '', 't', 't'], adjacentposition: [1, 2, 5, 6]},
    5: {face: 't', adjacent: ['', '', 'f', 'f'], adjacentposition: [1, 2, 3, 4]},
    6: {face: 't', adjacent: ['', '', 'f', 'f'], adjacentposition: [1, 2, 3 ,4]}
  },
  white: {
    1: {face: 'n', adjacent: ['n', 'n', 'l', 'll', 'll'], adjacentposition: [2, 3, 9, 10, 12]},
    2: {face: 'n', adjacent: ['n', 'n', 'l', 'll', 'll'], adjacentposition: [1, 3, 8, 11, 12]},
    3: {face: 'n', adjacent: ['n', 'n', 'nn', 'l', 'll'], adjacentposition: [1, 2, 5, 7, 8]},
    4: {face: 'n', adjacent: ['n', 'n', 'nn', 'l', 'll'], adjacentposition: [5, 6, 7, 9, 10]},
    5: {face: 'n', adjacent: ['n', 'n', 'nn', 'l', 'll'], adjacentposition: [4, 6, 7, 8, 11]},
    6: {face: 'n', adjacent: ['n', 'n', 'l', 'll', 'll'], adjacentposition: [4, 5, 9, 11, 12]},
    7: {face: 'nn', adjacent: ['n', 'n', 'n', 'l', 'll'], adjacentposition: [3, 4, 5, 8, 10]},
    8: {face: 'l', adjacent: ['n', 'n', 'n', 'nn', 'll'], adjacentposition: [2,3, 5, 7, 11]},
    9: {face: 'l', adjacent: ['n', 'n', 'n', 'll', 'll'], adjacentposition: [1, 4, 5, 6, 12]},
    10: {face: 'll', adjacent: ['n', 'n', 'n', 'nn', 'l'], adjacentposition: [1, 3, 4, 7, 9]},
    11: {face: 'll', adjacent: ['n', 'n', 'n', 'l', 'll'], adjacentposition: [2, 5, 8, 9, 12]},
    12: {face: 'll', adjacent: ['n', 'n', 'n', 'l', 'll'], adjacentposition: [1, 2, 6, 9, 11]}
  },
  success: {1: {face: 's', adjacent: [], adjacentposition: [1]}},
  advantage: {1: {face: 'a', adjacent: [], adjacentposition: [1]}},
  triumph: {1: {face: 'r', adjacent: [], adjacentposition: [1]}},
  failure: {1: {face: 'f', adjacent: [], adjacentposition: [1]}},
  threat: {1: {face: 't', adjacent: [], adjacentposition: [1]}},
  despair: {1: {face: 'd', adjacent: [], adjacentposition: [1]}},
  lightside: {1: {face: 'l', adjacent: [], adjacentposition: [1]}},
  darkside: {1: {face: 'n', adjacent: [], adjacentposition: [1]}},
}

exports.dice = dice;
