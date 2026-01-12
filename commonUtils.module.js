//==========================================================================
//============================ 컴퍼넌트 처리 =================================
//==========================================================================
class ComponentUtilsClass{

   /**
    * 카테고리 목록을 가져와 초기화
    * @param {Object} params
    * @param {HTMLElement} params.params.targetSelBox 초기화할 셀렉트 박스 요소
    * @param {Array}  params.params.optionList  추가할 옵션 리스트 배열
    * @param {String} params.params.firstOption 첫번째 옵션 기본값 "선택"
    * @param {String} params.params.optionValue 옵션 VAL  로 들어갈 Key 값
    * @param {String} params.params.optionText  옵션 TEXT 로 들어갈 key 값
    */
   initSelectBox(params){
      const targetSelBox = params.targetSelBox;
      const optionList   = params.optionList;
      const firstOption  = params.firstOption || "선택";
      const optionValue  = params.optionValue;
      const optionText   = params.optionText;

      targetSelBox.innerHTML = "";
      targetSelBox.insertAdjacentHTML('afterbegin', `<option>${firstOption}</option>`)
      optionList.forEach(item => {
         const option       = document.createElement('option');
         option.value       = item[optionValue];
         option.textContent = item[optionText];
         targetSelBox.appendChild(option);
      })
   }


   /**
    * API 로 카테고리 목록을 가져와 select 요소 초기화
    * @param {HTMLElement} selTarget 셀렉트박스 요소
    * @param {string} url 카테고리 목록을 가져올 APIurl
    */
   async initSelectBoxByUrl(selTarget, url){
      const categories = await simpleFetch(url).then(data=>data.rsList);

      selTarget.insertAdjacentHTML('afterBegin','<option value="">선택</option>');
      categories.forEach(item=>{
         const option = document.createElement('option');
         option.value = item.CATE_ID;
         option.innerText = item.CATE_NAM
         selTarget.appendChild(option);
      });
   }

   /**
    * 이벤트 삭제후 재 바인딩
    * @param {string} targetSelector 타겟 요소구분자
    * @param {string} eventFn            적용할 이벤트함수
    */
   offAddEvent(eventType, targetSelector, eventFn){
      const targets = document.querySelectorAll(targetSelector);

      targets.forEach(target => {
         if(target._eventFn) target.removeEventListener(eventType, target._eventFn)
      })

      targets.forEach(target => {
         target._eventFn = eventFn;
         target.addEventListener(eventType, target._eventFn);
      });
   }

   initSelectFilter(filterBtnSelector, dropDownSelector){
      const filterBtn      = document.querySelector(filterBtnSelector);
      const dropdownContent = document.querySelector(dropDownSelector);
      const arrow             = filterBtn.querySelector('svg');

      filterBtn.addEventListener('click', (e)=>{
         e.stopPropagation(); // 필수: 문서 클릭 이벤트와 충돌 방지
         dropdownContent.classList.toggle('show');

         if (arrow) {
             arrow.style.transform = dropdownContent.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0)';
         }
      });

      dropdownContent.querySelectorAll('a').forEach((item,index,arr) => {
         item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget;
            const selectedFilter = target.textContent;
            const filterText = filterBtn.querySelector('span');

            if (filterText) {
                filterText.textContent = selectedFilter;
            }
            dropdownContent.classList.remove("show");

            if (arrow) {
                arrow.style.transform = 'rotate(0)';
            }

            arr.forEach(item => item.classList.remove("active"));
            target.classList.add("active");
         });
      });
   }
}

export const ComponentUtils = new ComponentUtilsClass();


//==========================================================================
//============================== 문자열 처리 =================================
//==========================================================================
class StringUtilsClass {

   /**
    * HTML에서 텍스트만 추출
    * @param {string} html - HTML 문자열
    * @returns {string} 텍스트만 추출한 문자열
    */
   stripAndTruncate(html) {
     const parser = new DOMParser();
     const doc = parser.parseFromString(html, "text/html");

     return doc.body.textContent.trim();
   }


   /**
    * HTML에서 img 태그 링크 변경
    * @param {string} html - HTML 문자열
    */
   changeImgUrlPath(html) {
     const parser = new DOMParser();
     const doc = parser.parseFromString(html, "text/html");

     doc.body.querySelectorAll('img').forEach(item => {
      const originalSrc = item.getAttribute("src");
       if (originalSrc && !originalSrc.startsWith(contextPath)) {
          item.setAttribute("src", `${contextPath}${originalSrc.startsWith("/") ? "" : "/"}${originalSrc}`);
       }
     });

     return doc.body.innerHTML;
   }
}

export const StringUtils = new StringUtilsClass();


//==========================================================================
//=============================== DATE 처리 =================================
//==========================================================================
class DateUtilsclass {

   today = new Date();
   yyyy = this.today.getFullYear();
   mm = String(this.today.getMonth() + 1).padStart(2, '0');
   dd = String(this.today.getDate()).padStart(2, '0');

   getFormattedToday(){
      return `${this.yyyy}-${this.mm}-${this.dd}`;
   }

   getFirstDayOfMonth() {
       return `${this.yyyy}-${this.mm}-01`;
   }

   getLastDayOfMonth() {
       const lastDate = new Date(this.yyyy, this.today.getMonth() + 1, 0).getDate(); // 말일 계산
       return `${this.yyyy}-${this.mm}-${String(lastDate).padStart(2, '0')}`;
   }
}

export const DateUtils = new DateUtilsclass()

//==========================================================================
//============================== 페이징 처리 =================================
//==========================================================================
//페이징 처리 클래스
class PagingUtilsClass {

  target;     //페이지 버튼 렌더링 위치
  groupSize;  //한번에 보여질 페이지 버튼개수
  totalPages; //총 페이지 수
  curPage;    //현재 페이지
  loadFn;     //화면 렌더링 함수

/**
 * 페이징 영역 초기화 함수
 * @param {Object} params
 * @param {HTMLElement} params.target (Required) 페이징 처리 할 위치 div DOM
 * @param {String} params.totalCnt      (Required) 페이징 처리할 총 게시물 게수
 * @param {String} params.loadFn      (Required) 해당 페이징영역 게시물 조회&렌더링 함수 (pageNum을 인자로 받음)
 * @param {String} params.pageSize      (Optional) 한번에 표시될 게시물 수 (기본값 10)
 * @param {String} params.groupSize   (Optional) 한번에 보여질 게시물 버튼 수 (기본값 5)
 * @param {String} params.lastArrow   (Optional) 왼쪽 화살표 버튼 String 생성 함수 (pageNum을 인자로 받음)
 * @param {String} params.pageBtn     (Optional) 페이지 넘버 버튼 String 생성함수 (pageNum, isActive를 인자로 받음)
 * @param {String} params.nextArrow   (Optional) 오른쪽 화살표 버튼 String 생성 함수 (pageNum을 인자로 받음)
 */
  getPagination(params) {
     this.target      = params.target;
     this.groupSize  = params.groupSize || 5;

     const pageSize  = params.pageSize || 10;
     const totalCnt  = params.totalCnt;
     this.totalPages = Math.ceil(totalCnt / pageSize);

     this.loadFn       = params.loadFn;
     this.curPage    = 1;

     this.p_lastArrow  = params.lastArrow;
     this.p_pageBtn    = params.pageBtn;
     this.p_nextArrow  = params.nextArrow;

     this.#renderPublicPagination();
  }
  #startArrow(pageNum){
    return `<a style="cursor:pointer;" class="pagination-arrow page-btn" data-page="${pageNum}">
                <span class="material-symbols-outlined">
                    keyboard_double_arrow_left
                </span>
            </a>`;
  }

  #lastArrow(pageNum){
   if(this.p_lastArrow) return this.p_lastArrow(pageNum);
   return    `<button class="page-btn prev" data-page="${pageNum}">
              <span class="material-icons">chevron_left</span>
         </button>`
  }

  #pageBtn(pageNum, isActive){
   if(this.p_pageBtn) return this.p_pageBtn(pageNum, isActive);
   return `<button class="page-btn ${isActive}" data-page="${pageNum}">${pageNum}</button>`
  }

  #nextArrow(pageNum){
   if(this.p_nextArrow) return this.p_nextArrow(pageNum);
   return    `<button class="page-btn next" data-page="${pageNum}">
              <span class="material-icons">chevron_right</span>
         </button>`
  }

  #endArrow(pageNum){
    return `<a style="cursor:pointer;" class="pagination-arrow page-btn" data-page="${pageNum}">
                <span class="material-symbols-outlined">
                    keyboard_double_arrow_right
                </span>
            </a>`;
  }

  //사용자 페이지 페이지버튼 렌더링
  #renderPublicPagination() {
   const target      = this.target;
   const groupSize   = this.groupSize
   const totalPages  = this.totalPages
   const curPage     = this.curPage
   const groupStart  = Math.floor((curPage - 1) / groupSize) * groupSize + 1;
   const groupEnd    = Math.min(groupStart + groupSize - 1, totalPages);

   target.innerHTML = "";

    if (groupStart > 1) {
      totalPages > 10 && target.insertAdjacentHTML('beforeend' , this.#startArrow(1));

      target.insertAdjacentHTML('beforeend', this.#lastArrow(groupStart-1));
    }

    for (let i = groupStart; i <= groupEnd; i++) {
      const isActive = i === curPage ? "active" : "";
      target.insertAdjacentHTML('beforeend' ,this.#pageBtn(i,isActive));
    }

    if (groupEnd < totalPages) {
      target.insertAdjacentHTML('beforeend' , this.#nextArrow(groupEnd+1));

      totalPages > 10 && target.insertAdjacentHTML('beforeend' , this.#endArrow(totalPages));
    }

   //페이지버튼 클릭 이벤트 초기화
   const pageButtons = document.querySelectorAll('.page-btn');

   pageButtons.forEach((btn)=>{
      if(btn._clickEvent) btn.removeEventListener('click',btn._clickEvent);
   })

   pageButtons.forEach((btn)=>{
      const clickEvent = (e) => {
         e.preventDefault();
         const eventTarget = e.currentTarget;
         this.curPage = parseInt(eventTarget.dataset.page);
         this.loadFn(this.curPage);
         this.#renderPublicPagination();
      }
      btn._clickEvent = clickEvent;
      btn.addEventListener('click', clickEvent);
   })
  }
}

export const PagingUtils = new PagingUtilsClass();

