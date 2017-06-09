SG_EDU_CACHED_TPL["503"] =
`<div class="rb">
   <h3 class="pt">{@if row.____isDebug____==true}
       <div>\${row.____xml____}</div>
       {@/if}
       {@if row._needShowFileIcon }
       <img class="hb1" src="../../common/images/ui/\${row.smallicon_title}.gif" alt="\${row.smallicon_title}" title="\${row.smallicon_title}"/>
       {@/if}
       <a class="dttl" target="_blank" href="\${row.url}">\$\${row.title}</a>
      {@if row._needShowFileIcon }
      <a target="_blank" href="\${row.url}">
          <img width="41" title="下载" src="../../common/images/cloud/dldoc.gif"
               height="15" class="dldoc"
               alt="下载">
      </a>
       {@/if}
   </h3>
   <div class="ft">\$\${row.content}
   </div>
   <div class="fb"><cite>\${row.showurl}&nbsp;-&nbsp;\${row.date}</cite></div>
</div>
`