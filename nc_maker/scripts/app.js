const fileInputButton = document.getElementById('fileInputButton');
const convertButton = document.getElementById('convertButton');
const uploadedFilesList = document.getElementById('uploadedFilesList');
const projectNumberInput = document.getElementById('projectNumber');
const projectNameInput = document.getElementById('projectName');
const conversionStatus = document.getElementById('conversionStatus');
const prefixInputAll   = document.getElementById('prefixInputAll');
const startNumberInput = document.getElementById('startNumberInput');

let profiles = [];
var stpFiles=[];
let isCscHasLabel = false;
loadProfilesFromCSV();

async function loadProfilesFromCSV() {
    try {
        const response = await fetch(new URL('static/profiles.csv', location.href));
        const text = await response.text();
        profiles = text
            .split('\n')
            .map(line => line.trim().split(',')[0])
            .filter(value => value && value.length > 0);
    } catch (err) {
        console.error('Failed to load profiles.csv:', err);
    }
}

function populateProfileSizes(typeDropdown, sizeDropdown) {
    sizeDropdown.innerHTML = ''; // Clear existing options
    sizeDropdown.disabled = true; // Default to disabled

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Size';
    sizeDropdown.appendChild(defaultOption);

    const type = typeDropdown.value;
    let sizes = [];
    if (type === 'H') {
        sizes = profiles.filter(profile => profile.startsWith('H'));
    } else if (type === 'I') {
        sizes = profiles.filter(profile => profile.startsWith('I'));
    } else if (type === 'U') {
        sizes = profiles.filter(profile => profile.startsWith('U'));
    }

    if (sizes.length > 0) {
        sizeDropdown.disabled = false;
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeDropdown.appendChild(option);
        });
    }
}

async function displayUploadedFiles(files) {
    const controls = document.getElementById('controls');
    controls.style.display = 'flex';
    if (uploadedFilesList) {
        uploadedFilesList.querySelectorAll('li:not(#controls)').forEach(li => li.remove());
    }
    if (files.length > 0) {

        // Create list items for each file
        Array.from(files).forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.dataset.fileIndex = index;
            listItem.dataset.fileName = file.name;

            const initialPrefix = (document.getElementById('prefixInputAll')?.value || '') + ((parseInt(document.getElementById('startNumberInput')?.value, 10) || 1) + index);

            listItem.innerHTML = `
                 <div class="row-top">
                    <span class="prefix-display">${initialPrefix}</span>
                    <span class="file-name">${file.name}</span>
                </div>

                <div class="row-single">
                    <input type="number" class="quantity-input" value="1" min="1" aria-label="Quantity" />
                </div>

                <div class="row-single">
                    <label class="overwrite-checkbox"><input type="checkbox"><span>Overwrite</span></label>
                </div>

                <div class="row-single">
                    <select class="profile-type" aria-label="Profile type for ${file.name}">
                        <option value="">Select Type</option>
                        <option value="H">H</option>
                        <option value="I">I</option>
                        <option value="U">U</option>
                    </select>
                </div>

                <div class="row-single">
                    <select class="profile-size" aria-label="Profile size for ${file.name}" disabled>
                        <option value="">Select Size</option>
                    </select>
                </div>

                <div class="row-single">
                    <select class="material-dropdown" aria-label="Material for ${file.name}">
                        <option value="">Select Material</option>
                        <option value="S235">S235</option>
                        <option value="S275">S275</option>
                        <option value="S355">S355</option>
                    </select>
                </div>
                <div class="row-single">
                <button type="button" class="remove-row-button" aria-label="Remove file">✖</button>
            </div>
            `;
            uploadedFilesList.appendChild(listItem);

            const typeDropdown = listItem.querySelector('.profile-type');
            const sizeDropdown = listItem.querySelector('.profile-size');
            const overwriteCheckbox = listItem.querySelector('.overwrite-checkbox input[type="checkbox"]');
            const removeBtn = listItem.querySelector('.remove-row-button');

            overwriteCheckbox.addEventListener('change', () => {
                const isChecked = overwriteCheckbox.checked;
                if (isChecked) {
                    typeDropdown.disabled = false;
                    sizeDropdown.disabled = false;
                } else {
                    const originalProfile = JSON.parse(listItem.dataset.originalProfile || '{}');
                    if (originalProfile.type && originalProfile.size) {
                        typeDropdown.value = originalProfile.type;
                        populateProfileSizes(typeDropdown, sizeDropdown);
                        sizeDropdown.value = originalProfile.size;
                        typeDropdown.disabled = true;
                        sizeDropdown.disabled = true;
                    }
                }
            });
            removeBtn.addEventListener('click', () => {
                listItem.remove();
                updatePrefixes();
            });
            // Read file content and extract profile
            const reader = new FileReader();
            reader.onload = () => {
                const content = reader.result;
                // Try to find profile in HEADER section first
                let profile = findFirstProfileInHeader(content);
                // const profileMatch = content.match(/\/\* description \*\/\s*\('([^']+)'\)/);
                // let profile = '';
                // if (profileMatch) {
                //     profile = profileMatch[1].replace('-','');
                // }

                if (profile) {
                    let detectedType;
                    if (profile.startsWith('H')) {
                        detectedType = 'H';
                    } else if (profile.startsWith('I')) {
                        detectedType = 'I';
                    }else if (profile.startsWith('U')) {
                        detectedType = 'U';
                    }else  {
                        detectedType = '';
                    }

                    if (detectedType) {
                        typeDropdown.value = detectedType;
                        populateProfileSizes(typeDropdown, sizeDropdown);
                        sizeDropdown.value = profile;

                        // Store the original profile
                        listItem.dataset.originalProfile = JSON.stringify({ type: detectedType, size: profile });

                        typeDropdown.disabled = true;
                        sizeDropdown.disabled = true;
                    }
                    else {
                        overwriteCheckbox.checked = true;
                        overwriteCheckbox.disabled = true;
                    }

                }
                else {
                    overwriteCheckbox.checked = true;
                    overwriteCheckbox.disabled = true;
                }
            };
            reader.readAsText(file);
            // inside displayUploadedFiles, after creating `typeDropdown` and `sizeDropdown`:
            typeDropdown.addEventListener('change', () => {
                populateProfileSizes(typeDropdown, sizeDropdown);
            });
            // Handle overwrite checkbox changes
            overwriteCheckbox.addEventListener('change', () => {
                const isChecked = overwriteCheckbox.checked;

                if (isChecked) {
                    typeDropdown.disabled = false;
                    sizeDropdown.disabled = false;
                } else {
                    // Restore the original profile
                    const originalProfile = JSON.parse(listItem.dataset.originalProfile || '{}');
                    if (originalProfile.type && originalProfile.size) {
                        typeDropdown.value = originalProfile.type;
                        populateProfileSizes(typeDropdown, sizeDropdown);
                        sizeDropdown.value = originalProfile.size;

                        typeDropdown.disabled = true;
                        sizeDropdown.disabled = true;
                    }
                }
            });
        });
    }
}

async function sendFailedFilesByEmail(failedDetails, files) {
    const projectNumber = projectNumberInput.value.trim();
    const projectName = projectNameInput.value.trim();
    // Create a zip with JSZip
    const zip = new JSZip();

    // Add failed files
    failedDetails.forEach(detail => {
        const file = Array.from(files).find(f => f.name === detail.fileName);
        if (file) {
            zip.file(detail.fileName, file);
        }
    });

    // Generate the zip as a Blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Prepare error messages for the email body
    const errorText = failedDetails.map(f => `${f.fileName}: ${f.error}`).join('\n');

    // Prepare FormData
    const formData = new FormData();
    formData.append('subject', 'Error STEP Files');
    formData.append('body', `Error file details:\n${errorText}`);
    formData.append('attachment', zipBlob, `${projectName}_${projectNumber}_failed.zip`);

    // Send to Azure Function
    const res = await fetch('https://factoryfunctions.azurewebsites.net/api/SendEmailFunction?code=Bf-jCZu3gse08jleLLz2jgI7Lm1yrY1_z0hhZ_5pPMKLAzFueG16VQ==', {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }
    return await res.text();
}

async function loadProperties(csvFile) {
    try {
        const text = await csvFile.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) return;

        const headers = lines[0].split(',').map(h => h.trim());
        const fileIdx = headers.indexOf('FileName');
        const sizeIdx = headers.indexOf('ProfileType');
        const qtyIdx  = headers.indexOf('Quantity');
        const lblIdx  = headers.indexOf('Name');
        const materialIdx  = headers.indexOf('Material');
        if (fileIdx < 0 || sizeIdx < 0 || qtyIdx < 0) return;
        isCscHasLabel = lblIdx >= 0;
        const dataRows = lines.slice(1);
        const listItems = uploadedFilesList.querySelectorAll('li[data-file-index]');

        dataRows.forEach(line => {
            const cols = line.split(',').map(c => c.trim());
            const recordName = cols[fileIdx];
            const recordSize = cols[sizeIdx];
            const recordQty  = cols[qtyIdx];

            listItems.forEach(li => {
                const baseName = li.dataset.fileName.replace(/\.[^/.]+$/, '');
                if (baseName !== recordName) return;

                // Set quantity
                const qtyInput = li.querySelector('.quantity-input');
                if (qtyInput) qtyInput.value = recordQty;

                // Set material if available
                if (materialIdx >= 0) {
                    const recordMaterial = cols[materialIdx];
                    const materialDropdown = li.querySelector('.material-dropdown');
                    if (materialDropdown && recordMaterial) {
                        materialDropdown.value = recordMaterial;
                    }
                }

                // Set label if available
                if (lblIdx >= 0) {
                    const recordLabel = cols[lblIdx];
                    const prefixDisplay = li.querySelector('.prefix-display');
                    if (prefixDisplay && recordLabel) {
                        prefixDisplay.textContent = recordLabel;
                    }
                }

                // Only proceed if the CSV size exists in our loaded profiles
                if (!profiles.includes(recordSize)) return;

                // Detect type from size
                let detectedType;
                if (recordSize.startsWith('H')) {
                    detectedType = 'H';
                } else if (recordSize.startsWith('I')) {
                    detectedType = 'I';
                }else if (recordSize.startsWith('U')) {
                    detectedType = 'U';
                }else  {
                    return;
                }

                // Set overwrite checkbox
                const overwriteCb = li.querySelector('.overwrite-checkbox input[type="checkbox"]');
                if (overwriteCb) {
                    overwriteCb.checked = true;
                }

                // Load type and size
                const typeDropdown = li.querySelector('.profile-type');
                const sizeDropdown = li.querySelector('.profile-size');
                if (typeDropdown && sizeDropdown) {
                    typeDropdown.disabled = false;
                    typeDropdown.value = detectedType;
                    typeDropdown.dispatchEvent(new Event('change', { bubbles: true }));
                    sizeDropdown.value = recordSize;
                    sizeDropdown.disabled = false;
                }
            });
        });
    } catch (err) {
        console.error('Failed to load properties from CSV:', err);
    }
}

function findFirstProfileInHeader(text) {
    const match = text.match(/HEADER;([\s\S]*?)ENDSEC;/i);
    if (!match) return null;
    const header = match[1];
    const normalize = s => String(s).replace(/-/g, '').toLowerCase();
    const normHeader = normalize(header);
    let best = null;
    let bestIdx = Infinity;
    for (const p of profiles) {
        const np = normalize(p);
        const idx = normHeader.indexOf(np);
        if (idx >= 0 && idx < bestIdx) {
            bestIdx = idx;
            best = p;
        }
    }
    return best;
}

fileInputButton.addEventListener('change', async () => {
    const files = fileInputButton.files;
    // count only data rows (exclude the controls row)
    const existingRows = uploadedFilesList.querySelectorAll('li[data-file-index]').length;
    const isSingleCSV = files.length === 1 && files[0].name.toLowerCase().endsWith('.csv');

    if (existingRows > 0 && isSingleCSV) {
        await loadProperties(files[0]);
        return;
    }
    stpFiles = files;
    conversionStatus.textContent = 'Loading STEP files...';
    await displayUploadedFiles(files);
    conversionStatus.textContent = '';
});

convertButton.addEventListener('click', async () => {
    const files = stpFiles;
    const projectNumber = projectNumberInput.value.trim();
    const projectName = projectNameInput.value.trim();
    const prefixAll = prefixInputAll.value.trim();

    if (!projectNumber || !projectName) {
        conversionStatus.textContent = 'Please enter project number and project name.';
        conversionStatus.style.color = 'red';
        return;
    }
    if (!prefixAll && !isCscHasLabel) {
        conversionStatus.textContent = 'Please enter a prefix for assembly numbers.';
        conversionStatus.style.color = 'red';
        return;
    }

    if (files.length === 0) {
        conversionStatus.textContent = 'Please select at least one STEP file to upload.';
        conversionStatus.style.color = 'red';
        return;
    }


    const fileListItems = uploadedFilesList.querySelectorAll('li[data-file-index]');
    let isValid = true;
    let validationMessages = [];
    var errorMaterial = false;
    var errorProfile = false;
    fileListItems.forEach((li, index) => {
        const fileName = li.dataset.fileName;
        const materialDropdown = li.querySelector('.material-dropdown');
        const profileSizeDropdown = li.querySelector('.profile-size');

        if (!materialDropdown || !materialDropdown.value) {
            isValid = false;
            errorMaterial = true;
            // validationMessages.push(`File ${index + 1} (${fileName}): Please select a Material.`);
        }
        if (!profileSizeDropdown || profileSizeDropdown == "" || (!profileSizeDropdown.value)) {
            isValid = false;
            errorProfile = true;
            // validationMessages.push(`File ${index + 1} (${fileName}): Please select a Profile Size.`);
        }
    });
    if (errorMaterial) {
        validationMessages.push(`Please select Material for all files.`);
    }
    if (errorProfile) {
        validationMessages.push(`Please select Profile Size for all files.`);
    }

    if (!isValid) {
        conversionStatus.textContent = validationMessages.join('\n');
        conversionStatus.style.color = 'red';
        return;
    }

    conversionStatus.textContent = 'Preparing data...';
    const formData = new FormData();
    fileListItems.forEach((li) => {
        const fileIndex = parseInt(li.dataset.fileIndex, 10);
        const fileName = li.dataset.fileName;
        const file = files[fileIndex];

        const material = li.querySelector('.material-dropdown').value;
        const profileTypeDropdown = li.querySelector('.profile-type');
        const profileSizeDropdown = li.querySelector('.profile-size');
        const prefixDisplay = li.querySelector('.prefix-display');
        const startNumberInput = document.getElementById('startNumberInput');
        const currentType = profileTypeDropdown.value;
        const currentSize = profileSizeDropdown.value;
        const overwriteCheckbox = li.querySelector('.overwrite-checkbox input[type="checkbox"]');
        // use overwriteCheckbox.checked when preparing form data
        if (!overwriteCheckbox.checked) {
            profileSizeDropdown.disabled = true;
        }
        populateProfileSizes(profileTypeDropdown, profileSizeDropdown);
        profileTypeDropdown.value = currentType;
        profileSizeDropdown.value = currentSize;

        if (!overwriteCheckbox.checked) {
            profileSizeDropdown.disabled = true;
        }

        if (!currentType || !currentSize) {
            console.error(`Profile type or size is empty for file: ${fileName}`);
            conversionStatus.textContent = `Please select a valid profile type and size for file: ${fileName}`;
            conversionStatus.style.color = 'red';
            return;
        }

        let assemblyNumber = fileIndex + 1;
        if (startNumberInput) {
            const startNumber = parseInt(startNumberInput.value, 10);
            if (!isNaN(startNumber)) {
                assemblyNumber = startNumber + fileIndex;
            }
        }

        const assemblyValue = `${prefixDisplay ? prefixDisplay.textContent : ''}${assemblyNumber}`;
        const quantityInput = li.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value, 10) || 1;
        const metadata = {
            Material: material,
            Project: projectName,
            Profile: currentSize,
            Assembly: assemblyValue,
            AssemblyCount: quantity,
            FileName: fileName,
            Length: 0
        };

        try {
            formData.append(`stpFile_${fileName}`, JSON.stringify(metadata));
            formData.append(fileName, file);
        } catch (error) {
            console.error('Error serializing metadata:', error);
            conversionStatus.textContent = `Failed to prepare metadata for file: ${fileName}`;
            conversionStatus.style.color = 'red';
        }
    });

    try {
        // const functionUrl = 'http://localhost:7103/api/ProcessStpFileFunction';
        const functionUrl = 'https://factoryfunctions.azurewebsites.net/api/ProcessStpFileFunction?code=Bf-jCZu3gse08jleLLz2jgI7Lm1yrY1_z0hhZ_5pPMKLAzFueG16VQ==';
        const response = await fetch(functionUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`File conversion failed. Status: ${response.status}. ${errorText}`);
        }

        // Expect JSON with counts, file lists, and base64 zip
        const result = await response.json();
        const messages = [];
        if (result.successCount > 0) {
            messages.push(`${result.successCount} file(s) converted successfully.`);
        }
        if (result.failCount > 0) {
            messages.push(`${result.failCount} file(s) failed to convert.`);
        }
        if (result.failed && result.failed.length > 0) {
            messages.push(`Failed files: ${result.failed.join(', ')}.`);
        }
        conversionStatus.innerText = messages.length > 0 ? messages.join('\n') : 'No files processed.';
        if (result.failedDetails && result.failedDetails.length > 0) {
            try {
                await sendFailedFilesByEmail(result.failedDetails, files);
            } catch (err) {
                console.error('Failed to send email:', err);
            }
        }
        // Download the zip if available
        if (result.zipFile) {
            const byteCharacters = atob(result.zipFile);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const now = new Date();
            const timestamp = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(-2)}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

            a.href = url;
            a.download = `${projectName}_${projectNumber}_${timestamp}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error:', error);
        conversionStatus.textContent = 'Conversion failed. Please try again.';
        conversionStatus.style.color = 'red';

    }
});

prefixInputAll.addEventListener('input', () => {
    if (prefixInputAll.value.trim() === '') {
        startNumberInput.value = '';
        startNumberInput.disabled = true;
    } else {
        startNumberInput.value = '1';
        startNumberInput.disabled = false;
    }
});
const updatePrefixes = () => {
    const allPrefixFields = uploadedFilesList.querySelectorAll('.prefix-display');
    const startNumber = parseInt(startNumberInput.value, 10) || 1;
    allPrefixFields.forEach((prefixField, index) => {
        prefixField.textContent = `${prefixInputAll.value}${startNumber + index}`;
    });
};

prefixInputAll.addEventListener('input', updatePrefixes);
startNumberInput.addEventListener('input', updatePrefixes);

// Add event listeners for "Select for All" controls
const materialSelectAll = document.getElementById('materialSelectAll');
const profileTypeSelectAll = document.getElementById('profileTypeSelectAll');
const profileSizeSelectAll = document.getElementById('profileSizeSelectAll');
materialSelectAll.addEventListener('change', () => {
    const allMaterialDropdowns = uploadedFilesList.querySelectorAll('.material-dropdown');
    allMaterialDropdowns.forEach(dropdown => {
        dropdown.value = materialSelectAll.value;
    });
});

profileTypeSelectAll.addEventListener('change', () => {
    populateProfileSizes(profileTypeSelectAll, profileSizeSelectAll);
    const allTypeDropdowns = uploadedFilesList.querySelectorAll('.profile-type:not(:disabled)');
    allTypeDropdowns.forEach(dropdown => {
        dropdown.value = profileTypeSelectAll.value;
        dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    });
});

profileSizeSelectAll.addEventListener('change', () => {
    const allSizeDropdowns = uploadedFilesList.querySelectorAll('.profile-size:not(:disabled)');
    allSizeDropdowns.forEach(dropdown => {
        dropdown.value = profileSizeSelectAll.value;
    });
});
