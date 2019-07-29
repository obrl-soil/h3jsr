#' @importFrom V8 v8
#'
sesh <- NULL
.onLoad <- function(libname, pkgname) {
  # Establish js interface
  sesh <<- V8::v8()
  # latest version of lib suitable for v8 use will be at https://unpkg.com/h3-js
  sesh$source(system.file('js', 'h3-js.umd.js', package = pkgname))
  # sesh$source('inst/js/h3-js.umd.js')
  # sesh$eval("Object.keys(h3)")

}

