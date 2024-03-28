import themeEditor from "./settingscomponents/ThemeEditor.js";

function setEditorStyle() {
  var rootStyles = getComputedStyle(document.documentElement); // Get the computed styles of the root element
  var editorStyles = `
    .editor-toolbar {
      background-color: ${rootStyles.getPropertyValue("--editor")};
      opacity: 1;
      border: none;
      border-radius: 0px;

    }

    .editor-toolbar:hover{
      background-color: ${rootStyles.getPropertyValue("--editor")};
      opacity: 1;
    }
    
    .editor-toolbar a{
      color: ${rootStyles.getPropertyValue("--text")} !important;
    }

    .editor-toolbar i.separator {
      border:none;
      border-left: 1px solid ${rootStyles.getPropertyValue("--text")};
    }

    .editor-toolbar a.active,.editor-toolbar a:hover {
      background: ${rootStyles.getPropertyValue("--highlight")};
      border-color: ${rootStyles.getPropertyValue("--highlight")};
    }

    .editor-statusbar {
      background-color: ${rootStyles.getPropertyValue("--editor")};
    }

    .editor-statusbar span {
      color: ${rootStyles.getPropertyValue("--text")};
    }
  
    .CodeMirror {
        height: 100%;
        background-color: ${rootStyles.getPropertyValue(
          "--editor"
        )}; /* Editor background */
        color: ${rootStyles.getPropertyValue("--text")}; /* Text color */
        border: none;
        border-radius: 0px;
        font-size: 14px;
    }

    .CodeMirror-selected {
      background: ${rootStyles.getPropertyValue("--highlight")};
    }

    .CodeMirror-focused .CodeMirror-selected,.CodeMirror-line::selection,.CodeMirror-line>span::selection,.CodeMirror-line>span>span::selection {
      background: ${rootStyles.getPropertyValue("--highlight")};
    }

    .editor-preview,.editor-preview-side {
        background: ${rootStyles.getPropertyValue("--editor")};
        font-size: 14px;

    }
.editor-preview pre,.editor-preview-side pre {
  background: ${rootStyles.getPropertyValue("--editor")};

}
.editor-toolbar.fullscreen {
  background: ${rootStyles.getPropertyValue("--editor")};
  border-bottom: 1px solid ${rootStyles.getPropertyValue("--left")};
}
.editor-toolbar.fullscreen::before {
  background: ${rootStyles.getPropertyValue("--editor")};
}

.editor-toolbar.fullscreen::after {
  background: ${rootStyles.getPropertyValue("--editor")};
}

.editor-preview-side {
  border: none;
  border-left: 1px solid ${rootStyles.getPropertyValue("--left")};
}

.editor-toolbar.disabled-for-preview a:not(.no-disable) {
  background: ${rootStyles.getPropertyValue("--highlight")};
}

    .CodeMirror-gutters {
        background: ${rootStyles.getPropertyValue(
          "--left"
        )}; /* Gutters background */
    }

    .CodeMirror-cursor {
        border-color: ${rootStyles.getPropertyValue(
          "--text"
        )}; /* Cursor color */
    }

    .CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
        background: ${rootStyles.getPropertyValue(
          "--scrollbar-track-color"
        )}; /* Scrollbar filler background */
    }

    code {
      font-family: "Roboto Mono", monospace;
      font-size: 14px;
    }
`;

  editorStyles += codeSyntaxColoring();

  var styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = editorStyles;
  document.head.appendChild(styleSheet);
}

function codeSyntaxColoring() {
  return themeEditor.state == "light"
    ? `.hljs {
      color: #333 !important;
      background: #f8f8f8 !important
  }
  
  .hljs-comment,.hljs-quote {
      color: #998 !important;
  }
  
  .hljs-keyword,.hljs-selector-tag,.hljs-subst {
      color: #7f8000 !important;
  }
  
  .hljs-number,.hljs-literal,.hljs-variable,.hljs-template-variable,.hljs-tag .hljs-attr {
      color: #008080 !important
  }
  
  .hljs-string,.hljs-doctag {
      color: #d14 !important
  }
  
  .hljs-title,.hljs-section,.hljs-selector-id {
      color: #900 !important;
  }
  
  
  .hljs-type,.hljs-class .hljs-title {
      color: #458 !important;
  }
  
  .hljs-tag,.hljs-name,.hljs-attribute {
      color: #000080 !important;
  }
  
  .hljs-regexp,.hljs-link {
      color: #009926 !important
  }
  
  .hljs-symbol,.hljs-bullet {
      color: #990073 !important
  }
  
  .hljs-built_in,.hljs-builtin-name {
      color: #0086b3 !important
  }
  
  .hljs-meta {
      color: #999 !important;
  }
  
  .hljs-deletion {
      background: #fdd !important
  }
  
  .hljs-addition {
      background: #dfd !important
  }`
    : `.hljs {
      color: #ccc;
      background: #f8f8f8 !important
  }
  
  .hljs-comment,.hljs-quote {
      color: #767665 !important;
  }
  
  .hljs-keyword,.hljs-selector-tag,.hljs-subst {
      color: #e0e052 !important;
  }
  
  .hljs-number,.hljs-literal,.hljs-variable,.hljs-template-variable,.hljs-tag .hljs-attr {
      color: #52e0e0 !important
  }
  
  .hljs-string,.hljs-doctag {
      color: #ee2054 !important
  }
  
  .hljs-title,.hljs-section,.hljs-selector-id {
      color: #f66 !important;
  }

  .hljs-type,.hljs-class .hljs-title {
      color: #78b !important;
  }
  
  .hljs-tag,.hljs-name,.hljs-attribute {
      color: #8080ff !important;
  }
  
  .hljs-regexp,.hljs-link {
      color: #66ff8c !important
  }
  
  .hljs-symbol,.hljs-bullet {
      color: #ff66d9 !important
  }
  
  .hljs-built_in,.hljs-builtin-name {
      color: #4dd2ff !important
  }
  
  .hljs-meta {
      color: #666 !important;
  }
  
  .hljs-deletion {
      background: #240000 !important
  }
  
  .hljs-addition {
      background: ##002400 !important
  }`;
}

export default setEditorStyle;
