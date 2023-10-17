var site = {
	monthly_activity_all_time: 'data/monthly_activity_all_time.json',
	monthly_activity_last_year: 'data/monthly_activity_last_year.json',
	monthly_activity_last_1200_days: 'data/monthly_activity_last_1200_days.json',
	top_edited_countries: 'data/top_edited_countries.json',
	// mapbox_tileset_id: 'jenningsanderson.ym_changesets',
	// mapbox_tileset_id: 'jenningsanderson.442aud42',
	mapbox_tileset_id: 'jenningsanderson.0nzzv7oh',
	// mapbox_tileset_id: 'jenningsanderson.0n6avag4',
	// LOCAL_PORT: 3001
}

var prettyFormat = function(bigInt){

	if (bigInt > 1000000){
		return (bigInt / 1000000).toFixed(2)+'M'
	}

	if (bigInt > 1000){
		return (bigInt / 1000).toFixed(2)+'K'
	}

}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']