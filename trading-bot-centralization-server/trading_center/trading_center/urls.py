from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import PositionViewSet
from .views import UserViewSet
from .stripeViews import (
    CreateSubscriptionView,
    GetConfigView,
    create_checkout_session,
    create_customer,
    cancel_subscription,
    ListSubscriptionsView,
    InvoicePreviewView,
    update_subscription,
    webhook_received,
    check_subscription_status,
)


router = DefaultRouter()
router.register(r"positions", PositionViewSet)
router.register(r"users", UserViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include(router.urls)),
    path("config/", GetConfigView.as_view(), name="get_config"),
    path("create-customer/", create_customer, name="create_customer"),
    path(
        "create_checkout_session/",
        create_checkout_session,
        name="create_checkout_session",
    ),
    path(
        "check-subscription-status/",
        check_subscription_status,
        name="check_subscription_status",
    ),
    path("cancel-subscription/", cancel_subscription, name="cancel_subscription"),
    path("subscriptions/", ListSubscriptionsView.as_view(), name="list_subscriptions"),
    path("invoice-preview/", InvoicePreviewView.as_view(), name="invoice_preview"),
    path("update-subscription/", update_subscription, name="update_subscription"),
    path("webhook/", webhook_received, name="webhook"),
]
