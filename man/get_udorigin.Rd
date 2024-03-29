% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/unidirectional_edges.R
\name{get_udorigin}
\alias{get_udorigin}
\title{Get origin cell index from directed edge}
\usage{
get_udorigin(h3_edge = NULL, simple = TRUE)
}
\arguments{
\item{h3_edge}{Character; address of unidirectional edge.}

\item{simple}{Logical; whether to return a vector of outputs or a data frame
containing both inputs and outputs.}
}
\value{
By default, character vector of H3 indexes.
}
\description{
Get an H3 cell index representing the origin of a directed edge.
}
\examples{
# Get the origin cell of this directed edge
get_udorigin(h3_edge = '166be8d12fffffff')

}
