function showPopup() {
    let popup = document.getElementById("popup");
    document.getElementById("overlay").style.display = "flex";
    popup.style.animation = "move 1s forwards";
  }
  
  function hidePopup() {
    let popup = document.getElementById("popup");
    document.getElementById("overlay").style.display = "none";
    popup.style.animation = "none";
  }
  
  function setupTypewriter(t) {
    let HTML = t.innerHTML;
    t.innerHTML = "";
  
    let cursorPosition = 0,
      tag = "",
      writingTag = false,
      tagOpen = false,
      typeSpeed = 5,
      tempTypeSpeed = 0;
  
    let type = function () {
      if (writingTag === true) {
        tag += HTML[cursorPosition];
      }
  
      if (HTML[cursorPosition] === "<") {
        tempTypeSpeed = 0;
        if (tagOpen) {
          tagOpen = false;
          writingTag = true;
        } else {
          tag = "";
          tagOpen = true;
          writingTag = true;
          tag += HTML[cursorPosition];
        }
      }
  
      if (!writingTag && tagOpen) {
        tag.innerHTML += HTML[cursorPosition];
      }
  
      if (!writingTag && !tagOpen) {
        if (HTML[cursorPosition] === " ") {
          tempTypeSpeed = 0;
        } else {
          tempTypeSpeed = Math.random() * typeSpeed + 10;
        }
        t.innerHTML += HTML[cursorPosition];
      }
  
      if (writingTag === true && HTML[cursorPosition] === ">") {
        tempTypeSpeed = Math.random() * typeSpeed + 10;
        writingTag = false;
        if (tagOpen) {
          let newSpan = document.createElement("span");
          t.appendChild(newSpan);
          newSpan.innerHTML = tag;
          tag = newSpan.firstChild;
        }
      }
  
      cursorPosition += 1;
      if (cursorPosition < HTML.length - 1) {
        setTimeout(type, tempTypeSpeed);
      }
    };
  
    return {
      type: type,
    };
  }
  
  let typer = document.getElementById("typewriter");
  
  let typewriter = setupTypewriter(typer);
  
  // Access the button element by its ID
  const button = document.getElementById("closeButton");

  // Define what happens when the button is clicked
  button.addEventListener('click', function() {
    hidePopup();
  });

  if (!sessionStorage.getItem('welcomeSeen')) {
    typewriter.type();
    showPopup();
    sessionStorage.setItem('welcomeSeen', '1');
  } else {
    hidePopup();
  }
  