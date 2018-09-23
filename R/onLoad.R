#' @importFrom V8 v8
#'
sesh <- NULL
.onLoad <- function(libname, pkgname) {
  # Establish js interface
  sesh <<- V8::v8()
  # load required js packages from bundle
  sesh$source(system.file('js', 'h3js_bundle.js', package = pkgname))

}

