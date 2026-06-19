from django.urls import path
from .views import (
    me, register, mon_recuperateur,
    roles_list, roles_detail, roles_update_permissions,
    permissions_list, assign_role, audit_log,
)

urlpatterns = [
    path('me/',                        me),
    path('register/',                  register),
    path('mon-recuperateur/',          mon_recuperateur),
    path('roles/',                     roles_list),
    path('roles/<int:pk>/',            roles_detail),
    path('roles/<int:pk>/permissions/', roles_update_permissions),
    path('permissions/',               permissions_list),
    path('<int:user_id>/assign-role/', assign_role),
    path('audit-log/',                 audit_log),
]
