function GenerateAll() {
  
  var geo = '';
  if ( !geo.match(/\d/) && document.location.search && document.location.search.match(/.*&?geo=([\d,]+).*/) ) {
  	geo = document.location.search.replace(/%2C/ig, ',').replace(/.*&?geo=([\d,-]+).*/, "$1");
  }
  
  
  var rs = geo.split(/,/);
  for (var l = 0; l < rs.length; l++) {
    if (rs[l]) {
      var numReg = rs[l];
      if (rs[l] < 0) {
        numReg = -rs[l];
      }

      for (var m = 0; m < reg_form.length; m++) {
        var regexp = new RegExp('(^|[^0-9]+)' + numReg + '[^0-9]+');
        if (regexp.test(reg_form[m].id)) {

          if (rs[l] > 0) {
            reg_form[m].checked = true;
          } else {
            reg_form[m].checked = false;
          }
          Generate(reg_form[m]);
          openTree(reg_form[m]);
          break;
        }
      }
    }
  }
    
}

function collapseRegions(parent) {
    parent = parent || document.getElementById('beginRegions');
    var regionsBlocks = parent.childNodes;
    for (var i = 0;  i < regionsBlocks.length; i++) {
        if (regionsBlocks[i].tagName && regionsBlocks[i].tagName.toLowerCase() == 'div'
                && regionsBlocks[i].id && regionsBlocks[i].id.indexOf('region') != -1 && regionsBlocks[i].style.display == 'block') {

            var regionId = regionsBlocks[i].id.match(/^region(\d*)?/)[1];

            if (parent != document.getElementById('beginRegions')) {
                regtree(regionId);
            }
            changeSign(regionId, true);
            collapseRegions(regionsBlocks[i]);
        }
    }
}

function quick_choose( reg_id, dont_collapse ) {
    var regexp = new RegExp('(^|[^0-9]+)' + reg_id + '[^0-9]+');
    if (!dont_collapse) {
        reg_form.reset();
        collapseRegions();
    }
    for (var m = 0; m < reg_form.length; m++) {
        if (regexp.test( reg_form[m].id ) ) {
            reg_form[m].checked = true;
            Generate(reg_form[m]);
            openTree(reg_form[m]);
            return;
        }
    }
}

// Открываем дерево до текущего элемента
function openTree(f) {
    if ( !f || !f.id ) {
        return;
    }
    // Находим id всех отцов
    var parents_ids = f.id.replace(/^_+|_+$/g, '').split(/_/);
    for( var i = 0; i < parents_ids.length - 1; i++ ) {
        var d = document.getElementById( 'region' + parents_ids[i] );
        if ( d && d.style ) {
            // Открываем сам элемент
            d.style.display = 'block';
            // меняем знак
            var a = document.getElementById('link'+parents_ids[i]);
            if ( a ) a.innerHTML = "&#150;";
            // Если это последний элемент - ничего не делаем
            if ( i != parents_ids.length - 1 ) {
                // Открываем всех соседей
                var cn = d.childNodes;
                for( var j = 0; j < cn.length; j++ ) {
                    if ( cn[j] && cn[j].tagName == 'DIV' && cn[j].style ) {
                        cn[j].style.display = 'block';
                    }
                }
            }
        }
    }
}

function Generate(f, no_child_check) {
    if ( !f || f.checked == null ) return;
    var parent_id = f.id.replace(/\d+_$/, '');
    var all_checked = true, all_unchecked = true;
    var checked_num = 0, unchecked_num = 0;

    var parent_id_res = parent_id;    
    if( parent_id.match( '^[0-9]+_[0-9]+_' ) )
    {
         pra_parent_id = parent_id.replace(/\d+_$/, '');
	   var bc = document.getElementById(pra_parent_id);				
	   if( bc.checked )
	   {
        	var abc = document.getElementById(parent_id);
        	abc.checked = true;
         }
    }
    parent_id = parent_id_res;

    var one_of_parents_cheched = false;
    for (var j=0; j < reg_form.length; j++) {
        // идет внутрь и чекает детей
        if (
            reg_form[j].id.indexOf(f.id) == 0
            && f.id != reg_form[j].id
            && !no_child_check
        ) {
            reg_form[j].checked =  f.checked;
        }
        // проверяем чекнутость родителей
        if (
            f.id.indexOf(reg_form[j].id) == 0
            && f.id != reg_form[j].id
        ) {
            if (reg_form[j].checked) one_of_parents_cheched = true;
        } 
        // Проверяем детей на чекнутость
        if (
            reg_form[j].id.indexOf(parent_id) == 0
            && reg_form[j].id != parent_id
        ) {
            all_checked = all_checked && reg_form[j].checked;
            if (reg_form[j].checked) checked_num++;
            all_unchecked = all_unchecked && !reg_form[j].checked;
            if (!reg_form[j].checked) unchecked_num++;
        }
    }
    // меняем, если нужно статуc отца
    var parent_chk = document.getElementById(parent_id);
    if (parent_chk && !parent_chk.checked
        && checked_num > 0 && one_of_parents_cheched
    ) {
        parent_chk.checked = true;
        Generate(parent_chk, true);       
    }
    // Специальное ограничение для медийки, СЗ регион - нельзя СЗ,-Санкт-Петербург
    if (
        parent_chk && all_checked && checked_num > 1
        && !parent_chk.checked
    ) {
        parent_chk.checked = true;
        Generate(parent_chk);
    } else if (
        parent_chk && all_unchecked 
        && (unchecked_num > 1 || parent_chk.id.match(/_17_$/))
        && parent_chk.checked
    ) {
        parent_chk.checked = false;
        Generate(parent_chk);
    }
    if ( f.checked ) {
        // Получаем текущий id
        var re = new RegExp('(?:[0-9_]*?)?([0-9]+)_$');
        var reg_id = f.id.replace(re, '$1');
        var a = document.getElementById('link'+reg_id);
        if ( a ) { a.innerHTML = "&#150;"; }
        // Открываем всех соседей
        var cn = f.parentNode.childNodes;
        for( var j = 0; j < cn.length; j++ ) {
            if ( cn[j] && cn[j].tagName == 'DIV' && cn[j].style ) {
                cn[j].style.display = 'block';
            }
        }
    }
}

function save(f) {
  document.getElementById("debug").innerHTML = "";

  regions_name = '';
  regions_name_with_comas = '';
  regions_id = '';
  regions_exept_flag = false;
  var bid = '';
  regions = document.getElementById("beginRegions").childNodes;

  //document.getElementById("debug").innerHTML = regions.length + "<br>";

  for (i = 0; i < regions.length; i++) {
    if (regions.item(i).tagName == 'DIV') {
      processReg(regions.item(i));
    }
  }

  //document.getElementById("debug").innerHTML += regions_name + "<br>" + regions_id + "<br>";
  if(!regions_name) regions_name = "Россия\nСНГ (исключая Россию)\nЕвропа\nАзия\nАфрика\nСеверная Америка\nЮжная Америка\nАвстралия и Океания";
  if(!regions_name_with_comas) regions_name_with_comas = "Россия, СНГ (исключая Россию), Европа, Азия, Африка, Северная Америка, Южная Америка, Австралия и Океания";
  if(!regions_id) regions_id = "0";
  if(regions_exept_flag) regions_name += ')\n';
  if(regions_exept_flag) regions_name_with_comas += ')';
  
     window.parent.setRegions(regions_id, regions_name_with_comas);
  
  
}

function processReg(div) {
  var childs = div.childNodes;

  var parentChecked = false;
  for (var i = 0; i < childs.length; i++) {
    if (childs.item(i).type == 'checkbox') {

      parentChilds = childs.item(i).parentNode.parentNode.childNodes;
      for (j = 0; j < parentChilds.length; j++) {
            if (parentChilds[j].type == 'checkbox') {
              parentChecked = parentChilds[j].checked;
            }
      }

      ids = childs.item(i).id.split('_');
      if (childs.item(i).checked && !parentChecked ) {
        //document.getElementById("debug").innerHTML += childs.item(i).value + " " + ids[ids.length - 2] + "<br>";
        if (regions_exept_flag) {
            regions_name += ')\n';
            regions_name_with_comas += '), ';
            regions_exept_flag = false;
        } else if (regions_name != '') {
            regions_name += '\n';
            regions_name_with_comas += ', ';
        }
        regions_name += childs.item(i).value;
        regions_name_with_comas += childs.item(i).value;
        regions_id += ids[ids.length - 2] + ",";
      } 
      
      if (!childs.item(i).checked && parentChecked) {
        //document.getElementById("debug").innerHTML += "&#151;" + childs.item(i).value + "<br>";
        if (regions_exept_flag) {
            regions_name += ", " + childs.item(i).value;
            regions_name_with_comas += ", " + childs.item(i).value;
        } else {
            regions_exept_flag = true;
            regions_name += " (кроме: " + childs.item(i).value;
            regions_name_with_comas += " (кроме: " + childs.item(i).value;
        }
        regions_id += "-" + ids[ids.length - 2] + ",";
      }
    }

    if (childs.item(i).tagName == 'DIV') {
      processReg(childs.item(i));
    }

  }
}

function regtree(regID) {
  regID = document.getElementById("region" + regID);
  if (regID.style.display == 'none') {
      regID.style.display = 'block';
        }
  else {
      regID.style.display = 'none';
        }
  return false;
}

function changeSign(regID, toPlusOnly) {
  regID = document.getElementById("link" + regID);
  if (!regID) { return; }
  if (regID.innerHTML == "+" && !toPlusOnly) {
    regID.innerHTML = "&#150;";
  } else {
    regID.innerHTML = "+";
  }

  return false;
}