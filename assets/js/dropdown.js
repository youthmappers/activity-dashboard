// Relevant Global Variables

var selectedChapters = new Set()
var chapterIndexMap = new Map()

// Populate the dropdown and search menu
var group = document.createElement('optgroup')
group.innerHTML = "YouthMappers Chapters"
chapters.forEach(function(chap){
	// console.log(chap)
	var option = document.createElement('option')
	option.value = chap.chapter_id
	option.text = chap['Chapter Name']
	option.setAttribute('data-subtext', chap.university + ', ' + chap.city + ', ' + chap.country);


	chapterIndexMap[chap.chapter_id] = chap['Chapter Name']
	// option.setAttribute('', chap);
	// console.log(option)
	if (chap.chapter!=''){
		group.appendChild(option)
	}
})
document.getElementById('dropdown').appendChild(group)


function dropDownSelect(e){
	
	var chap = Number(document.getElementById('dropdown').value)

	console.log(document.getElementById('dropdown'))

	// If it exists, we remove it
	if (selectedChapters.has(chap)){
		selectedChapters.delete(chap)
		updateFiltersFromChaptersList();

	// Else, we add it
	}else{
		
		selectedChapters.add(chap)
		
		thisChapLi = document.createElement('li')
		thisChapLi.classList.add('selected-chapter')

		remove = document.createElement('a')
		remove.text = '[X] '

		text = document.createElement('p')
		text.style.display = 'inline-block'
		text.innerHTML = chapterIndexMap[chap]

		thisChapLi.appendChild(remove)
		thisChapLi.appendChild(text)
		thisChapLi.id = chap
		
		remove.addEventListener('click',function(){
			document.getElementById(chap).remove();
			selectedChapters.delete(chap)
			updateFiltersFromChaptersList()
		})
		
		document.getElementById('selected-chapters').appendChild(thisChapLi)
		updateFiltersFromChaptersList()
	}
}

function updateFiltersFromChaptersList(){

	chapterFilters = ['any']
	selectedChapters.forEach(function(chap){
		chapterFilters.push(['==','chapter_id',chap])
	})

	mapFilters = mapFilters.slice(0,2)
	
	if (selectedChapters.size>0){
		mapFilters.push(chapterFilters)
	}
	
	setFilters();
}

