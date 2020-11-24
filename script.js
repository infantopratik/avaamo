const fs = require("fs");
const http = require("http");
const readline = require("readline");

const file = fs.createWriteStream("big.txt");

console.log("Fetching remote file...");
http.get("http://norvig.com/big.txt", (response) => {
  let stream = response.pipe(file);

  stream.on("finish", function () {
    const wordsDirectory = {};
    console.log("Remote file fetched");
    const bigTextFile = readline.createInterface({
      input: fs.createReadStream("big.txt"),
      output: process.stdout,
      terminal: false,
    });

    console.log("Parsing file...");
    bigTextFile.on("line", (line) => {
      const wordsArray = line.split(" ");
      wordsArray.forEach((word) => {
        let lowerCaseWord = word.toLowerCase();
        if (lowerCaseWord.length <= 5) return;
        if (!wordsDirectory[lowerCaseWord]) {
          wordsDirectory[lowerCaseWord] = 1;
        } else {
          const count = wordsDirectory[lowerCaseWord] + 1;
          wordsDirectory[lowerCaseWord] = count;
        }
      });
    });

    const dictionary = [];
    bigTextFile.on("close", () => {
      console.log("Parsing Complete");
      for (const key in wordsDirectory) {
        if (wordsDirectory.hasOwnProperty(key)) {
          const element = wordsDirectory[key];
          dictionary.push({
            word: key,
            occurrences: element,
          });
        }
      }
      const sortedDictionary = dictionary.sort(function (a, b) {
        return b.occurrences - a.occurrences;
      });
      console.log(sortedDictionary.slice(0, 10));
    });
  });
});
