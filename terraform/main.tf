
# Resource Group (Sweden)

resource "azurerm_resource_group" "rg" {
  name     = "hair-salon-rg"
  location = "Sweden Central"
}


# Azure Container Registry (ACR)

resource "azurerm_container_registry" "acr" {
  name                = "hairsalonacr12345" # MUST be globally unique
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = false
}


# AKS Cluster

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "hair-salon-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "hairsalon"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_B2s_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}


# Allow AKS to Pull from ACR

resource "azurerm_role_assignment" "acr_pull" {
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.acr.id
}

# Kubernetes Namespace

resource "kubernetes_namespace" "app" {
  metadata {
    name = "hair-salon"
  }
}


# Kubernetes Deployment

# Kubernetes Deployment with Probes and Resource Limits
resource "kubernetes_deployment" "app" {
  metadata {
    name      = "hair-salon-deployment"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    replicas = 3

    selector {
      match_labels = {
        app = "hair-salon"
      }
    }

    template {
      metadata {
        labels = {
          app = "hair-salon"
        }
      }

      spec {
        container {
          name  = "hair-salon-container"
          image = "${azurerm_container_registry.acr.login_server}/hair-salon:1.0"

          image_pull_policy = "Always"

          port {
            container_port = 5000
          }

          # Resource requests and limits (required for HPA)
          resources {
            requests = {
              cpu    = "250m"  # Request 250 milliCPU
              memory = "128Mi"  # Request 128 MiB memory
            }
            limits = {
              cpu    = "500m"   # Limit to 500 milliCPU
              memory = "256Mi"   # Limit to 256 MiB memory
            }
          }

          # Startup probe - checks if application has started
          startup_probe {
            http_get {
              path = "/health"
              port = 5000
            }
            failure_threshold = 30
            period_seconds    = 10
          }

          # Readiness probe - checks if application is ready to receive traffic
          readiness_probe {
            http_get {
              path = "/health"
              port = 5000
            }
            initial_delay_seconds = 5
            period_seconds        = 5
            success_threshold     = 1
            failure_threshold     = 3
          }

          # Liveness probe - checks if application is alive
          liveness_probe {
            http_get {
              path = "/health"
              port = 5000
            }
            initial_delay_seconds = 15
            period_seconds        = 20
            failure_threshold     = 3
          }
        }
      }
    }
  }

  depends_on = [
    azurerm_role_assignment.acr_pull
  ]
}


# Kubernetes Service (Public LoadBalancer)

resource "kubernetes_service" "app" {
  metadata {
    name      = "hair-salon-service"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = {
      app = "hair-salon"
    }

    port {
      port        = 5000
      target_port = 5000
    }

    type = "LoadBalancer"
  }
}