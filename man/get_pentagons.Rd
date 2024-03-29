% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/core_api.R
\name{get_pentagons}
\alias{get_pentagons}
\title{get the pentagon indices for an H3 resolution}
\usage{
get_pentagons(res = NULL, simple = TRUE)
}
\arguments{
\item{res}{Integer; Desired H3 resolution. See
\url{https://h3geo.org/docs/core-library/restable/} for allowable values and related dimensions.}

\item{simple}{Logical; whether to return outputs as list of outputs (TRUE) or
data frame with both inputs and outputs.}
}
\value{
By default, a list of \code{length(h3_address)}. Each list element
  contains a vector of twelve H3 addresses. If \code{simple = FALSE}, a data
  frame with a column of input resolutions and a list-column of pentagon
  indexes for each.
}
\description{
This function returns the indices of all pentagons occurring at a
given H3 resolution.
}
\examples{
# Which indexes are pentagons at resolution 7?
get_pentagons(res = 7)
}
