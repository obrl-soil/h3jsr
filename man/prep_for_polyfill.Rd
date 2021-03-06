% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/helpers.R
\name{prep_for_polyfill}
\alias{prep_for_polyfill}
\alias{prep_for_polyfill.sf}
\alias{prep_for_polyfill.sfc}
\alias{prep_for_polyfill.sfg}
\title{Prepare geometry for polyfill}
\usage{
prep_for_polyfill(polys = NULL)

\method{prep_for_polyfill}{sf}(polys = NULL)

\method{prep_for_polyfill}{sfc}(polys = NULL)

\method{prep_for_polyfill}{sfg}(polys = NULL)
}
\arguments{
\item{polys}{`sf`, `sfc` or `sfg` POLYGON/MULTIPOLYGON object.}
}
\value{
`geojson` representation of supplied geometry.
}
\description{
Converts a variety of possible input geometries to geojson for
\code{\link[h3jsr:polyfill]{h3jsr::polyfill()}}.
}
\keyword{internal}
