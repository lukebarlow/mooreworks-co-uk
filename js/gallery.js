var thumbnailWidth = 300;
var thumbnailHeight = 200;
var previousSectionIndex = 0;
var selectedSectionIndex = 0;

var greyOut = null;
var sections = null;

var visibleText = null;

function thumbnailMouseOver(){
  if (visibleText){
    visibleText.style('display','none')
  }
  visibleText = d3.select(this.parentElement).select('.thumbnailText')
  visibleText.style('display','block')

  d3.select('body').on('mouseover.textrollover', function(){
    if (d3.select(d3.event.srcElement.parentElement).attr('id') == 'thumbnails'){
      if (visibleText){
        visibleText.style('display','none')
        visibleText = null
      }
    }
  })
}


var thumbnailPath = function(d){
  return sections[selectedSectionIndex].name + '/' + d.name + '/thumb.jpg'
}


function thumbnailComponent(selection){

  thumbnails = selection.filter(function(d){return d.type == 'folder'})
  html = selection.filter(function(d){return d.type == 'html'})

  thumbnails
    .attr('class','thumbnail')
    .on('click', showSlideshow)

  thumbnails
    .append('img')
    .attr('src', thumbnailPath)
    .style('cursor','pointer')
    .on('mouseover', thumbnailMouseOver)

  thumbnails
    .append('div')
    .attr('class','thumbnailText')
    .append('div')
    .html(function(d){ return d.name })

  html.attr('class', 'htmlThumbnail')
    .html(function(d){
      var el = document.getElementById(d.elementId)
      var h = el.innerHTML
      return el.innerHTML
    })

}


function init(){


  d3.json('site.json', function(_sections){

    sections = _sections

    var thumbnails = d3.select('#main').append('div').attr('id','thumbnails');

    thumbnail = thumbnails.append('div')
      .selectAll('span.thumbnail')
      .data(sections[selectedSectionIndex].children)
      .enter()
      .append('span')
      .call(thumbnailComponent)
      

    function update(){
      section.selectAll('text')
        .classed('selected', function(d,i,j){ 
          return j == selectedSectionIndex
        })
    }

    function getRowTops(){
      tops = []
      d3.selectAll('span.thumbnail').each(function(d){
        offsetTop = this.offsetTop
        if (tops.indexOf(offsetTop) == -1){
          tops.push(offsetTop)
        }
      })
      return tops
    }

    function countRows(){
      tops = getRowTops()
      return tops.length
    }

    //selectedSectionIndex = 0
    //nextSection()

    // function setVisibleRows(){
    //   tops = getRowTops()
    //   visibleRows = tops.filter(function(rowTop){
    //     return (rowTop + thumbnailHeight) >= window.scrollY && rowTop <= window.scrollY + window.innerHeight
    //   }).map(function(rowTop){
    //     return tops.indexOf(rowTop)
    //   })
    // }

    function scrollTransition(){
      var targetY = 0;
      var startY = null;
      var position = 0;
      var time = 0;
      var timer;
      var ease = d3.ease('cubic-in-out')
      var scrollTo = function(_targetY, duration){
        if (!duration) duration = 1000;
        startY = window.scrollY;
        targetY = _targetY;
        timer = d3.timer(function(time){
          window.scrollTo(0, startY + ease(time / duration) * (targetY - startY));
          return time > duration;
        })
      }

      return scrollTo
    }

    var scroller = scrollTransition()

    //window.onscroll = setVisibleRows

    function nextSection(){

      var thumbnailContainer = d3.selectAll('#thumbnails > div')
      var width = thumbnailContainer.node().clientWidth

      thumbnailContainer.style('position','absolute')
        .style('left','230px')
        .style('width', function(){ return width + 'px' })

      thumbnailContainer.transition()
        .duration(1000)
        .style('left', function(){
          if (previousSectionIndex < selectedSectionIndex){
            return '-' + window.innerWidth + 'px'
          }else{
            return '+' + window.innerWidth + 'px'
          }
        })
        //.transition()
        .remove()

      newThumbnail = thumbnails.append('div')
        .selectAll('span.thumbnail')
        .data(sections[selectedSectionIndex].children)
        .enter()
        .append('span')
        .call(thumbnailComponent)
        // .style('opacity', 0)
        // .transition()
        // .delay(200)
        // .duration(1000)
        // .style('opacity', 1)
        
      //setTimeout(setVisibleRows, 10)
      
    }
  })
}

function showSlideshow(item) {

  var index = 0

  function selectedItem(){
    while (index < 0){index += item.children.length}
    index = index % item.children.length
    return item.children[index];
  }

  function src(){
    var img = selectedItem()
    return sections[selectedSectionIndex].name + '/' + item.name + '/' + img.name;
  }

  function youtubeId(){
    var item = selectedItem()
    return item.youtubeId
  }

  var navHeight = document.body.clientHeight / 2 - 20 + 'px';

  greyOut = d3.select('body')
    .append('div')
    .attr('class','greyOut')

  var detailImage = greyOut.append('img')
    .attr('class','detail')

  var youtubeHolder = greyOut.append('div')
    .attr('class','detail')
    .html('YOUTUBE THINGY WILL GO HERE')
    .style('width','600px')
    .style('color','white')
    .style('display','none')

  function redraw(){
    var s = src()
    var type = s.split('.').pop()
    if (type == 'youtube'){
      detailImage.style('display','none')
      youtubeHolder.style('display','block')
        .html('')
        .append('iframe')
        .attr('width', 600)
        .attr('height', 500)
        .attr('src', 'https://www.youtube.com/embed/' + youtubeId())
        .attr('frameborder', 0)
        .attr('allowfullscreen', true)

    }else{
      youtubeHolder.style('display','none')
      detailImage
        .style('display','block')
        .attr('src', src())
    }
  }

  greyOut.append('img')
    .attr('class','closer')
    .attr('src', 'images/close.png')
    .on('click', function(){
      greyOut.remove()
    })

  greyOut.append('img')
    .attr('class','left')
    .attr('src', 'images/left.png')
    .style('top', navHeight)
    .on('click', function(){
      index--;
      redraw();
    })

  greyOut.append('img')
    .attr('class','right')
    .attr('src', 'images/right.png')
    .style('top', navHeight)
    .on('click', function(){
      index++;
      redraw();
    })

  redraw()
}