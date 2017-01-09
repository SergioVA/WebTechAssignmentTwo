// Create a "close" button and append it to each list item
$(document).ready(function() {
  var myNodelist = document.getElementsByTagName("LI");
  var i;

  // Click on a close button to hide the current list item
  var close = document.getElementsByClassName("close");
  var i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";

      var itemtext = $(ev.target).parent().parent().contents().filter(function(){
        return this.nodeType == 3;
      })[0].nodeValue;

      $.ajax( {url: '/profile', type: 'DELETE', data: {text:itemtext , done: $(ev.target).hasClass('true')}});
    }
  }

  // Add a "checked" symbol when clicking on a list item
  var list = document.querySelector('#todolist ul');
  list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'LI') {
      ev.target.classList.toggle('true');
    }
    var itemtext = $(ev.target).contents().filter(function(){
      return this.nodeType == 3;
    })[0].nodeValue;
    itemtext = itemtext.trim();

    $.post('/profile', {text:itemtext , done: $(ev.target).hasClass('true')});
  }, false);

  //add enter event to the input field
  $('#myInput').on('keyup', function (e) {
    if (e.keyCode == 13) {
        newElement();
    }
  });

});

// Create a new list item when clicking on the "Add" button
function newElement() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("myInput").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must enter a task before adding it!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }
  document.getElementById("myInput").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }

  $.post('/profile', {text: inputValue, done: false});
}
