// Verify these against the official "Course List Array" from the assignment,
// then set completed: true for the courses YOU have finished.
const courses = [
  { subject: "CSE", number: 110, title: "Introduction to Programming", credits: 2, certificate: "Web and Computer Programming", description: "Introduces programming concepts using Python.", technology: ["Python"], completed: true },
  { subject: "WDD", number: 130, title: "Web Fundamentals", credits: 2, certificate: "Web and Computer Programming", description: "Introduces HTML and CSS to build web pages.", technology: ["HTML", "CSS"], completed: true },
  { subject: "CSE", number: 111, title: "Programming with Functions", credits: 2, certificate: "Web and Computer Programming", description: "Teaches how to write and use functions.", technology: ["Python"], completed: false },
  { subject: "CSE", number: 210, title: "Programming with Classes", credits: 2, certificate: "Web and Computer Programming", description: "Introduces object-oriented programming.", technology: ["C#"], completed: false },
  { subject: "WDD", number: 131, title: "Dynamic Web Fundamentals", credits: 2, certificate: "Web and Computer Programming", description: "Adds JavaScript to create dynamic pages.", technology: ["HTML", "CSS", "JavaScript"], completed: true },
  { subject: "WDD", number: 231, title: "Web Frontend Development I", credits: 2, certificate: "Web and Computer Programming", description: "Builds responsive, accessible front ends.", technology: ["HTML", "CSS", "JavaScript"], completed: false }
];

const list = document.querySelector("#course-list");
const creditsOutput = document.querySelector("#credits");
const buttons = document.querySelectorAll(".filters button");

function displayCourses(courseArray) {
  list.innerHTML = "";
  courseArray.forEach((course) => {
    const item = document.createElement("li");
    item.textContent = `${course.subject} ${course.number}`;
    if (course.completed) {
      item.classList.add("completed");
      item.setAttribute("aria-label", `${course.subject} ${course.number}, completed`);
    }
    list.appendChild(item);
  });

  const totalCredits = courseArray.reduce((sum, course) => sum + course.credits, 0);
  creditsOutput.textContent = `The total credits for course listed above is ${totalCredits}`;
}

function filterCourses(filter) {
  const filtered = filter === "all" ? courses : courses.filter((course) => course.subject === filter);
  displayCourses(filtered);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    buttons.forEach((b) => b.setAttribute("aria-pressed", b === button));
    filterCourses(button.dataset.filter);
  });
});

displayCourses(courses);
