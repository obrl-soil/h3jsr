% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/unidirectional_edges.R
\name{is_valid_edge}
\alias{is_valid_edge}
\title{Check H3 directed edge index}
\usage{
is_valid_edge(h3_edge = NULL, simple = TRUE)
}
\arguments{
\item{h3_edge}{Address of directed edge.}

\item{simple}{Logical; whether to return a vector of outputs or a data frame
containing both inputs and outputs.}
}
\value{
By default, a logical vector of length(h3_edge).
}
\description{
This function checks whether an H3 directed edge index is valid.
}
\examples{
# is the following directed edge index valid?
is_valid_edge(h3_edge = '166be8d12fffffff')

}