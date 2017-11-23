/**
 * Serialize form into javascript object
 * @return { Object }   Serialized form as javascript object
 */
$.fn.serializeObject = function () {
	var o = {},
		a = this.serializeArray();

	$.each(a, function () {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});

	return o;
}

let url = 'https://c7xj8b7r70.execute-api.us-east-1.amazonaws.com/latest/invoices/',
	mode = 'new';

let navList = $('#navList'),
	navAdd =$('#navAdd'),
	tableBody = $('#tableBody');

let form = $('#form'),
	formInvoiceId = $('#formInvoiceId'),
	formName = $('#formName'),
	formValue = $('#formValue'),
	formDate = $('#formDate'),
	btnAddInvoice =$('#btnAddInvoice'),
	btnAddNewField = $('#btnAddNewField'),
	isFormValid = true;

if (location.href.indexOf('index.html') !== -1) {
	getData(function(data) {
		tableBody.html('');

		for (let i = 0; i < data.length; i++) {
			addInvoiceInTable(data[i]);
		}
	});
}
getFormData();

function goToHomePage() {
	location.href = 'index.html';
}

function goToFormPage(id) {
	if (id) {
		location.href = 'form.html?id=' + id;
	} else {
		location.href = 'form.html';
	}
}

function getFormData() {
	let pageUrl = new URL(location.href);
	let id = pageUrl.searchParams.get('id');
	
	if (id) {
		$.ajax({
			type: 'GET',
			url: url + id,
			dataType: 'json',
			contentType: 'application/json',
			success: function (response) {
				populateData(response);
			}
		});	
	}
}

function getData(success) {
	$.ajax({
		type: 'GET',
		url: url,
		contentType: 'application/json',
		success: function (data) {
			typeof success === 'function' ? success(data) : null;
		}
	});
}

function createInvoiceRow(invoice) {
	let row = `<tr class="js-invoice-row" data-invoice-id="${invoice.invoicesid}">`;

	for (let i in invoice) {
		i !== 'invoicesid' ? row += `<td>${invoice[i]}</td>` : null;
	}

	row += '<td>\
				<button class="btn btn-small btn-edit js-btn-edit">Edit</button>\
				<button class="btn btn-small btn-delete js-btn-delete">Delete</button>\
			</td>';
	row += '</tr>';

	return row;
}

function addInvoiceInTable(invoice) {
	let formatedInvoice = {
			invoicesid: invoice.invoicesid,
			name: invoice.name,
			val: invoice.val,
			date: invoice.date
		},
		row = createInvoiceRow(formatedInvoice);

	tableBody.append(row);
}

function addNewInvoice(invoice, callback) {
	$.ajax({
		type: 'POST',
		url: url,
		contentType: 'application/json',
		data: JSON.stringify(invoice),
		success: function () {
			typeof callback === 'function' ? callback() : null;
		}
	});
}

function deleteInvoice($row) {
	let invoiceId = $row.data('invoice-id');

	$.ajax({
		type: 'DELETE',
		url: url + invoiceId,
		contentType: 'application/json',
		success: function (data) {
			$row.remove();
		}
	});
}

function editInvoice(invoice, callback) {
	$.ajax({
		type: 'PUT',
		url: url + invoice.invoicesid,
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(invoice),
		success: function (response) {
			typeof callback === 'function' ? callback(response) : null;
		}
	});	
}

function populateData(data) {
	for (let i in data) {
		$('[name=' + i + ']').val(data[i]);
	}

	mode = 'edit';
	btnAddInvoice.html('Edit');
}

function addNewField() {
	let newLabel = `<label for="formNewLabel" id="formNewLabel">New label</label>`,
		newField = `<input type="text" id="formNewField" name="newField" />`,
		newErrorMessage = `<p class="input-error js-input-error"></p>`;

	form.find('.js-input-error').last().after(newLabel);
	form.find('label').last().after(newField);
	form.find('input').last().after(newErrorMessage);	
}

function formValidation() {
	$('.js-input-error').html('');

	isFormValid = true;

	let dateArr = formDate.val().split('-');

	for (let i = 0; i < dateArr.length; i++) {
		if (Number.isInteger(parseInt(dateArr[i])) === false) {
			formDate.next().html('Please enter valid date');
			isFormValid = false;
		}
	}

	if (formName.val().length < 1) {
		formName.next().html('Please fill Name');
		isFormValid = false;
	}

	if (formValue.val().length < 1) {
		formValue.next().html('Please fill Value');
		isFormValid = false;
	}

	if (formDate.val().indexOf('-') !== 4 && formDate.val().indexOf('-') !== 7) {
		formDate.next().html('Please enter valid date');
		isFormValid = false;
	}
}

navList.on('click', function() {
	goToHomePage();
});

navAdd.on('click', function() {
	goToFormPage();
});

btnAddInvoice.on('click', function () {
	formValidation();

	if (isFormValid) {
		let invoice = form.serializeObject();

		if (mode === 'new') {
			addNewInvoice(invoice, goToHomePage);
		} else {
			editInvoice(invoice, goToHomePage);
		}
	}
});

tableBody.on('click','.js-btn-delete', function() {
	let $row = $(this).closest('.js-invoice-row');
	deleteInvoice($row);
});

tableBody.on('click', '.js-btn-edit', function() {
	let invoiceId = $(this).closest('.js-invoice-row').data('invoice-id');
	goToFormPage(invoiceId);
});

btnAddNewField.on('click', function() {
	addNewField();
});
