import { AxiosError } from "axios";

const HttpStatusCode = {
  Unauthorized: 401,
  UnprocessableEntity: 422,
  NotFound: 404
};

class ErrorUtils {
  static handleError(err, options) {
    const {
      fn,
      isErrorInstanceFn,
      isNotErrorInstanceFn,
      isUnprocessableEntityErrorFn,
      isNotFoundErrorFn,
      isUnauthorizedErrorFn,
      isSyntaxErrorFn
    } = options ?? {};
    if (err instanceof AxiosError) {
      // do something
      isErrorInstanceFn?.(err);
      if (isUnprocessableEntityError(err)) {
        isUnprocessableEntityErrorFn?.(err);
      }
      if (isNotFoundError(err)) {
        isNotFoundErrorFn?.(err);
      }
      if (isUnauthorizedError(err)) {
        isUnauthorizedErrorFn?.(err);
      }
    } else {
      if (typeof err === 'string') {
        isNotErrorInstanceFn?.(err);
      } else if (err instanceof SyntaxError) {
        isSyntaxErrorFn?.(err);
      }
    }
    fn && fn();
  }

  static handleCommonError(err, t) {
    ErrorUtils.handleError(err, {
      isErrorInstanceFn: (error) => {
        // Handle error here
      }
    });
  }
}

const isUnauthorizedError = (error) => {
  return error.request.status === HttpStatusCode.Unauthorized;
};

const isUnprocessableEntityError = (error) =>
  error.request.status === HttpStatusCode.UnprocessableEntity;

const isNotFoundError = (error) =>
  error.request.status === HttpStatusCode.NotFound;

export { ErrorUtils, isUnauthorizedError, isUnprocessableEntityError, isNotFoundError };
