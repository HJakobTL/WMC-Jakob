const students = [
  { name: "Anna", age: 17, grade: 2 },
  { name: "Ben", age: 16, grade: 4 },
  { name: "Clara", age: 18, grade: 1 },
  { name: "David", age: 17, grade: 5 },
  { name: "Elena", age: 16, grade: 3 },
  { name: "Felix", age: 19, grade: 2 },
  { name: "Gina", age: 17, grade: 1 },
  { name: "Hugo", age: 18, grade: 4 },
];

let passed = students.filter( (stud) => stud.grade <= 4);

let labels = students.map( (stud) => `${stud.name} (${stud.age})`);

let passedNames = passed.map((stud) => stud.name);

let avgGrades = students.reduce((acc, stud) =>  { return acc += stud.grade/students.length },0);

let bonus = students.filter((stud) => stud.grade <= 4 && stud.age >= 17).map((stud) => `${stud.name}`).join(", ");

let chain = students.reduce((acc, stud) => acc + " " + stud
    .name,"").trim();

console.log(passed);
console.log(labels);
console.log(passedNames);
console.log(avgGrades);
console.log(bonus);
console.log(chain);
