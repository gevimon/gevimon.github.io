const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('convertButton');
const downloadSection = document.getElementById('downloadSection');
const uploadedFilesList = document.getElementById('uploadedFilesList');
const projectNumberInput = document.getElementById('projectNumber');
const projectNameInput = document.getElementById('projectName');
const conversionStatus = document.getElementById('conversionStatus');
// const profiles = ['HEA100','HEA120','HEA140','HEA160','HEA180','HEA200','HEA220','HEA240','HEA260','HEA280','HEA300','HEA320','HEA340','HEA360','HEA400','HEA450','HEA500','HEA550','HEA600','HEA650','HEA700','HEA800','HEA900','HEA1000','HEB100','HEB120','HEB140','HEB160','HEB180','HEB200','HEB220','HEB240','HEB260','HEB280','HEB300','HEB320','HEB340','HEB360','HEB400','HEB450','HEB500','HEB550','HEB600','HEB650','HEB700','HEB800','HEB900','HEB1000','UPN30','UPN40','UPN50','UPN60','UPN65','UPN80','UPN100','UPN120','UPN140','UPN160','UPN180','UPN200','UPN220','UPN240','UPN260','UPN280','UPN300']
let profiles = [];

async function loadProfilesFromCSV() {
    try {
        const response = await fetch('nc_maker/static/profiles.csv');        const text = await response.text();
        profiles = text
            .split('\n')
            .map(line => line.trim().split(',')[0])
            .filter(value => value && value.length > 0);
    } catch (err) {
        console.error('Failed to load profiles.csv:', err);
    }
}
// Call this before any code that uses `profiles`
loadProfilesFromCSV();
// --- Helper function to populate profile size options ---

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
        sizes = profiles.filter(profile => profile.startsWith('H') || profile.startsWith('I'));
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

// --- End Helper ---

fileInput.addEventListener('change', async () => {
    conversionStatus.textContent = 'Loading STEP files...';
    await displayUploadedFiles(fileInput.files);
    conversionStatus.textContent = '';

});
uploadButton.addEventListener('click', async () => {
    const files = fileInput.files;
    const projectNumber = projectNumberInput.value.trim();
    const projectName = projectNameInput.value.trim();

    if (!projectNumber || !projectName) {
        alert('Please enter both project number and project name.');
        return;
    }

    if (files.length === 0) {
        alert('Please select at least one STEP file to upload.');
        return;
    }

    const fileListItems = uploadedFilesList.querySelectorAll('li[data-file-index]');
    let isValid = true;
    let validationMessages = [];

    fileListItems.forEach((li, index) => {
        const fileName = li.dataset.fileName;
        const materialDropdown = li.querySelector('.material-dropdown');
        const profileSizeDropdown = li.querySelector('.profile-size');

        if (!materialDropdown || !materialDropdown.value) {
            isValid = false;
            validationMessages.push(`File ${index + 1} (${fileName}): Please select a Material.`);
        }
        if (!profileSizeDropdown || (!profileSizeDropdown.disabled && !profileSizeDropdown.value)) {
            isValid = false;
            validationMessages.push(`File ${index + 1} (${fileName}): Please select a Profile Size.`);
        }
    });

    if (!isValid) {
        alert(validationMessages.join('\n'));
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
        const overwriteCheckbox = li.querySelector('.overwrite-checkbox');

        // Save current type and size values
        const currentType = profileTypeDropdown.value;
        const currentSize = profileSizeDropdown.value;

        // Repopulate size options and restore saved values
        populateProfileSizes(profileTypeDropdown, profileSizeDropdown);
        profileTypeDropdown.value = currentType;
        profileSizeDropdown.value = currentSize;

        // Ensure sizeDropdown remains disabled if overwrite is not checked
        if (!overwriteCheckbox.checked) {
            profileSizeDropdown.disabled = true;
        }

        // Validate profile type and size
        if (!currentType || !currentSize) {
            console.error(`Profile type or size is empty for file: ${fileName}`);
            alert(`Please select a valid profile type and size for file: ${fileName}`);
            return; // Skip this file if type or size is invalid
        }

        let assemblyNumber = fileIndex + 1; // Default fallback
        if (startNumberInput) {
            const startNumber = parseInt(startNumberInput.value, 10);
            if (!isNaN(startNumber)) {
                assemblyNumber = startNumber + fileIndex;
            }
        }

        const assemblyValue = `${prefixDisplay ? prefixDisplay.textContent : ''}${assemblyNumber}`;

        const metadata = {
            Material: material,
            Project: projectName,
            Profile: currentSize, // Ensure profile size is valid
            Assembly: assemblyValue, // Concatenated value
            FileName: fileName, // Keep the original file name
            Length: 0
        };

        // Ensure metadata is serialized correctly
        try {
            formData.append(`stpFile_${fileName}`, JSON.stringify(metadata));
            formData.append(fileName, file);
        } catch (error) {
            console.error('Error serializing metadata:', error);
            alert(`Failed to prepare metadata for file: ${fileName}`);
        }
    });
    try {
        const functionUrl = 'https://factoryfunctions.azurewebsites.net/api/ProcessStpFileFunction?code=Bf-jCZu3gse08jleLLz2jgI7Lm1yrY1_z0hhZ_5pPMKLAzFueG16VQ==';
        // const functionUrl = 'http://localhost:7103/api/ProcessStpFileFunction';
        const response = await fetch(functionUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`File conversion failed. Status: ${response.status}. ${errorText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'processed-files.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        conversionStatus.textContent = 'Conversion completed successfully!';
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while converting files: ${error.message}`);
        conversionStatus.textContent = 'Conversion failed. Please try again.';
    }
});
async function displayUploadedFiles(files) {
    uploadedFilesList.innerHTML = ''; // Clear the list

    if (files.length > 0) {
        // Add "Select for All" controls at the top
        const controls = document.createElement('li');
        controls.classList.add('controls');
        controls.innerHTML = `
          <li class="controls">
    <fieldset>
        <legend>Apply to All Files</legend>
        <div>
            <select id="materialSelectAll">
                <option value="">Material</option>
                <option value="S235">S235</option>
                <option value="S275">S275</option>
                <option value="S355">S355</option>
            </select>
        </div>
        <div>
            <select id="profileTypeSelectAll">
                <option value="">Type</option>
                <option value="H">H</option>
                <option value="U">U</option>
            </select>
        </div>
        <div>
            <select id="profileSizeSelectAll" disabled>
                <option value="">Size</option>
            </select>
        </div>
        <div>
            <input type="number" id="startNumberInput" value="1" min="1" placeholder="Start No.">
        </div>
        <div>
            <input type="text" id="prefixInputAll" placeholder="Prefix">
        </div>
    </fieldset>
</li>
            `;
        uploadedFilesList.appendChild(controls);

        // Add event listeners for "Select for All" controls
        const materialSelectAll = document.getElementById('materialSelectAll');
        const profileTypeSelectAll = document.getElementById('profileTypeSelectAll');
        const profileSizeSelectAll = document.getElementById('profileSizeSelectAll');
        const prefixInputAll = document.getElementById('prefixInputAll');
        const startNumberInput = document.getElementById('startNumberInput');
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

        const updatePrefixes = () => {
            const allPrefixFields = uploadedFilesList.querySelectorAll('.prefix-display');
            const startNumber = parseInt(startNumberInput.value, 10) || 1;
            allPrefixFields.forEach((prefixField, index) => {
                prefixField.textContent = `${prefixInputAll.value}${startNumber + index}`;
            });
        };

        prefixInputAll.addEventListener('input', updatePrefixes);
        startNumberInput.addEventListener('input', updatePrefixes);

        // Create list items for each file
        Array.from(files).forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.dataset.fileIndex = index;
            listItem.dataset.fileName = file.name;

            const initialPrefix = (document.getElementById('prefixInputAll')?.value || '') + ((parseInt(document.getElementById('startNumberInput')?.value, 10) || 1) + index);

            listItem.innerHTML = `
                <span class="prefix-display">${initialPrefix}</span>
                <span class="file-name">${file.name}</span>
                <label>
                    <input type="checkbox" class="overwrite-checkbox">
                    Overwrite
                </label>
                <div class="dropdown-container">
                    <select class="profile-type" aria-label="Profile type for ${file.name}">
                        <option value="">Select Type</option>
                        <option value="H">H</option>
                        <option value="U">U</option>
                    </select>
                    <select class="profile-size" aria-label="Profile size for ${file.name}" disabled>
                        <option value="">Select Size</option>
                    </select>
                    <select class="material-dropdown" aria-label="Material for ${file.name}">
                        <option value="">Select Material</option>
                        <option value="S235">S235</option>
                        <option value="S275">S275</option>
                        <option value="S355">S355</option>
                    </select>
                </div>
            `;
            uploadedFilesList.appendChild(listItem);

            const typeDropdown = listItem.querySelector('.profile-type');
            const sizeDropdown = listItem.querySelector('.profile-size');
            const overwriteCheckbox = listItem.querySelector('.overwrite-checkbox');

            // Read file content and extract profile
            const reader = new FileReader();
            reader.onload = () => {
                const content = reader.result;
                const profileMatch = content.match(/\/\* description \*\/\s*\('([^']+)'\)/);
                const profile = profileMatch[1].replace('-','');
                if (profileMatch && profiles.includes(profile)) {
                    const detectedType = profile.startsWith('HEB') || profile.startsWith('HEA') ? 'H' : (profile.startsWith('UPN') ? 'U' : '');

                    if (detectedType) {
                        typeDropdown.value = detectedType;
                        populateProfileSizes(typeDropdown, sizeDropdown);
                        sizeDropdown.value = profile;

                        // Store the original profile
                        listItem.dataset.originalProfile = JSON.stringify({ type: detectedType, size: profile });

                        typeDropdown.disabled = true;
                        sizeDropdown.disabled = true;
                    }
                }
            };
            reader.readAsText(file);

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