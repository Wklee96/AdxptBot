document.getElementById('optionsNum').addEventListener('change', function () {
  var number = document.getElementById('optionsNum').value;
  var options = document.getElementById('saleOptions');

  while (options.hasChildNodes()) {
    options.removeChild(options.lastChild);
  }

  for (var i = 0; i < number; i++) {
    var cardDiv = document.createElement('div');
    cardDiv.setAttribute('class', 'form-group');

    var label = document.createElement('label');
    label.setAttribute('for', 'productTypes' + (i + 1));
    label.appendChild(document.createTextNode('Option ' + (i + 1) + ' Display Text'));

    var input = document.createElement('input');
    input.setAttribute('class', 'form-control');
    input.type = 'text';
    input.name = `productTypes[${i}][text]`;
    input.id = 'productTypes' + (i + 1);
    input.placeholder = 'Example: 2 Bottles - RM180 (66% OFF for 2nd bottle)';
    input.required = true;

    cardDiv.appendChild(label);
    cardDiv.appendChild(input);

    options.appendChild(cardDiv);
    options.appendChild(document.createElement('br'));
  }
});

document.getElementById('uiNum').addEventListener('change', function () {
  var number = document.getElementById('uiNum').value;
  var options = document.getElementById('usageInstructions');

  while (options.hasChildNodes()) {
    options.removeChild(options.lastChild);
  }

  for (var i = 0; i < number; i++) {
    var textDiv = document.createElement('div');
    textDiv.setAttribute('class', 'form-group');

    var label = document.createElement('label');
    label.setAttribute('for', 'UI');
    label.appendChild(document.createTextNode('Line ' + (i + 1) + ' Text'));

    var textarea = document.createElement('textarea');
    textarea.setAttribute('class', 'form-control');
    textarea.name = 'usageInstructions[][text]';
    textarea.id = 'UI';
    textarea.rows = '3';
    textarea.required = true;

    textDiv.appendChild(label);
    textDiv.appendChild(textarea);

    var urlDiv = document.createElement('div');
    urlDiv.setAttribute('class', 'form-group');

    label = document.createElement('label');
    label.setAttribute('for', 'UI');
    label.appendChild(document.createTextNode('Line ' + (i + 1) + ' Image Url'));

    var input = document.createElement('input');
    input.setAttribute('class', 'form-control');
    input.type = 'url';
    input.name = 'usageInstructions[][url]';
    input.id = 'UI';
    input.required = true;

    urlDiv.appendChild(label);
    urlDiv.appendChild(input);

    options.appendChild(textDiv);
    options.appendChild(urlDiv);
    options.appendChild(document.createElement('br'));
  }
});

document.getElementById('diNum').addEventListener('change', function () {
  var number = document.getElementById('diNum').value;
  var options = document.getElementById('deliveryInformation');

  while (options.hasChildNodes()) {
    options.removeChild(options.lastChild);
  }

  for (var i = 0; i < number; i++) {
    var textDiv = document.createElement('div');
    textDiv.setAttribute('class', 'form-group');

    var label = document.createElement('label');
    label.setAttribute('for', 'DI');
    label.appendChild(document.createTextNode('Line ' + (i + 1) + ' Text'));

    var textarea = document.createElement('textarea');
    textarea.setAttribute('class', 'form-control');
    textarea.name = 'deliveryInformation[][text]';
    textarea.id = 'DI';
    textarea.rows = '3';
    textarea.required = true;

    textDiv.appendChild(label);
    textDiv.appendChild(textarea);

    options.appendChild(textDiv);
    options.appendChild(document.createElement('br'));
  }
});
