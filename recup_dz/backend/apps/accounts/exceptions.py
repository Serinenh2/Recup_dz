from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler


class PermissionDenied403(APIException):
    status_code = 403
    default_code = 'permission_denied'
    default_detail = 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None and response.status_code == 403:
        response.data = {
            'error': 'Accès refusé',
            'detail': response.data.get('detail', PermissionDenied403.default_detail),
            'code': 'permission_denied',
        }
    return response
