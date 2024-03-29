% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/core_api.R
\name{get_res}
\alias{get_res}
\title{get the resolution of an H3 cell index}
\usage{
get_res(h3_address = NULL, simple = TRUE)
}
\arguments{
\item{h3_address}{Character; 15-character index generated by H3.}

\item{simple}{Logical; whether to return a vector of outputs or a data frame
containing both inputs and outputs.}
}
\value{
By default, an integer vector of \code{length(h3_address)}, ranging
  from 1 to 15.
}
\description{
This function returns an H3 cell index's resolution level.
}
\examples{
# What is the resolution of this H3 cell index?
get_res(h3_address = '8abe8d12acaffff')
}
